// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IX402 {
    function settlePayment(
        uint256 orderId,
        address buyer,
        address seller,
        uint256 amount
    ) external;
}