// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/IX402.sol";
import "../security/Roles.sol";
import "../config/ConfigManager.sol";
import "../libraries/PaymentLib.sol";
import "./EscrowLogic.sol";

contract CommerceCore is
    Roles,
    ConfigManager,
    EscrowLogic,
    ReentrancyGuard,
    Pausable
{
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IX402 public x402;

    address public platformOwner;

    enum ProductType { DIGITAL, PHYSICAL }

    enum OrderStatus {
        ESCROW_HOLD,
        REFUND_REQUESTED,
        DISPUTED,
        COMPLETED,
        REFUNDED,
        CANCELLED
    }

    struct Order {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        ProductType productType;
        OrderStatus status;
        uint256 createdAt;
        uint256 riskScore;
    }

    uint256 public orderCounter;
    mapping(uint256 => Order) public orders;

    event OrderCreated(uint256 indexed id, address buyer, address seller);
    event OrderCompleted(uint256 indexed id);
    event Refunded(uint256 indexed id);
    event RefundRequested(uint256 indexed id);
    event PlatformOwnerChanged(address newOwner);

    constructor(address _usdc, address _x402) {
        require(_usdc != address(0), "Invalid USDC");
        usdc = IERC20(_usdc);
        x402 = IX402(_x402);
        platformOwner = msg.sender;
        _setInitialConfig();
    }

    function createOrder(
        address seller,
        uint256 amount,
        ProductType productType
    ) external nonReentrant whenNotPaused {
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Self trade");
        require(amount > 0, "Invalid amount");

        _updateDailyLimit(msg.sender, amount, dailyLimit);

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        orderCounter++;

        Order storage order = orders[orderCounter];
        order.id = orderCounter;
        order.buyer = msg.sender;
        order.seller = seller;
        order.amount = amount;
        order.productType = productType;
        order.createdAt = block.timestamp;
        
        // 🔥 SMART LOGIC:
        if (productType == ProductType.DIGITAL && amount < adminApprovalThreshold) {
            // ✅ Digital + Small Amount → Auto Complete (Listener bypass)
            order.status = OrderStatus.COMPLETED;
            
            // Payout 
            PaymentLib.processPayout(
                usdc,
                platformOwner,
                seller,
                amount,
                platformFeeBps
            );
            
            if (address(x402) != address(0)) {
                try x402.settlePayment(
                    orderCounter,
                    msg.sender,
                    seller,
                    amount
                ) {} catch {}
            }
        } else {
            // ❌ Physical or Large Digital → ESCROW_HOLD
            order.status = OrderStatus.ESCROW_HOLD;
        }

        emit OrderCreated(orderCounter, msg.sender, seller);
    }


    function _completeOrder(uint256 orderId) internal {

        Order storage order = orders[orderId];
        require(order.buyer != address(0), "Invalid order");
        require(order.status == OrderStatus.ESCROW_HOLD, "Invalid status");

        order.status = OrderStatus.COMPLETED;

        PaymentLib.processPayout(
            usdc,
            platformOwner,
            order.seller,
            order.amount,
            platformFeeBps
        );

        if (address(x402) != address(0)) {
            try x402.settlePayment(
                orderId,
                order.buyer,
                order.seller,
                order.amount
            ) {} catch {}
        }

        emit OrderCompleted(orderId);
    }

    function requestRefund(uint256 orderId)
        external
        nonReentrant
        whenNotPaused
    {
        Order storage order = orders[orderId];
        require(order.buyer != address(0), "Invalid order");
        require(msg.sender == order.buyer, "Not buyer");
        require(order.status == OrderStatus.ESCROW_HOLD, "Invalid status");

        if (block.timestamp <= order.createdAt + refundWindow) {

            order.status = OrderStatus.REFUNDED;
            usdc.safeTransfer(order.buyer, order.amount);
            emit Refunded(orderId);

        } else {
            order.status = OrderStatus.REFUND_REQUESTED;
            emit RefundRequested(orderId);
        }
    }

    function confirmDelivery(uint256 orderId)
        external
        nonReentrant
        whenNotPaused
    {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender, "Not buyer");
        require(order.status == OrderStatus.ESCROW_HOLD, "Invalid");

        _completeOrder(orderId);
    }

    function adminApprove(uint256 orderId)
        external
        onlyAdmin
    {
        Order storage order = orders[orderId];
        require(order.buyer != address(0), "Invalid order");
        require(order.status == OrderStatus.ESCROW_HOLD, "Invalid");

        _completeOrder(orderId);
    }

    function adminReject(uint256 orderId)
        external
        onlyAdmin
    {
        Order storage order = orders[orderId];
        require(order.buyer != address(0), "Invalid order");
        require(order.status == OrderStatus.ESCROW_HOLD, "Invalid");

        order.status = OrderStatus.CANCELLED;
        usdc.safeTransfer(order.buyer, order.amount);
    }

    function setPlatformOwner(address newOwner)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newOwner != address(0), "Invalid address");
        platformOwner = newOwner;
        emit PlatformOwnerChanged(newOwner);
    }

    function setRiskScore(uint256 orderId, uint256 score)
    external
    onlyBot
    {
        require(score <= 100, "Invalid score");
        require(orders[orderId].buyer != address(0), "Invalid order");
        orders[orderId].riskScore = score;
    }

    // ===============================
    // ADMIN CONFIG CONTROLS
    // ===============================

    function setDailyLimit(uint256 value)
    external
    onlyAdmin
    {
        _setDailyLimit(value);
    }

    function setAdminThreshold(uint256 value)
    external
    onlyAdmin
    {
        _setAdminThreshold(value);
    }

    function setPlatformFee(uint256 value)
    external
    onlyAdmin
    {
        _setPlatformFee(value);
    }

    function setRefundWindow(uint256 value)
    external
    onlyAdmin
    {
        _setRefundWindow(value);
    }

    function setRiskThreshold(uint256 value)
    external
    onlyAdmin
    {
        _setRiskThreshold(value);
    }
}