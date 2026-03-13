// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract EscrowLogic {

    mapping(address => uint256) public dailySpent;
    mapping(address => uint256) public lastReset;

    function _updateDailyLimit(
        address buyer,
        uint256 amount,
        uint256 limit
    ) internal {

        if (block.timestamp >= lastReset[buyer] + 1 days) {
            dailySpent[buyer] = 0;
            lastReset[buyer] = block.timestamp;
        }

        require(dailySpent[buyer] + amount <= limit, "Daily limit exceeded");

        dailySpent[buyer] += amount;
    }
}