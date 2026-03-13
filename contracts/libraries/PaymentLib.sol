// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library PaymentLib {

    using SafeERC20 for IERC20;

    function processPayout(
        IERC20 token,
        address owner,
        address seller,
        uint256 amount,
        uint256 feeBps
    ) internal {

        require(owner != address(0), "Invalid owner");
        require(seller != address(0), "Invalid seller");

        uint256 fee = (amount * feeBps) / 10000;
        uint256 sellerAmount = amount - fee;

        token.safeTransfer(owner, fee);
        token.safeTransfer(seller, sellerAmount);
    }
}