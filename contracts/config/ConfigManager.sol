// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract ConfigManager {

    uint256 public dailyLimit;
    uint256 public adminApprovalThreshold;
    uint256 public platformFeeBps;
    uint256 public refundWindow;
    uint256 public riskThreshold;

    uint256 internal constant MAX_FEE_BPS = 1000; // Max 10%

    event ConfigUpdated(string key, uint256 value);

    function _setInitialConfig() internal {
        dailyLimit = 1000e6;
        adminApprovalThreshold = 1000e6;
        platformFeeBps = 184;
        refundWindow = 24 hours;
        riskThreshold = 70;
    }

    function _setDailyLimit(uint256 value) internal {
        require(value > 0, "Invalid limit");
        dailyLimit = value;
        emit ConfigUpdated("DAILY_LIMIT", value);
    }

    function _setAdminThreshold(uint256 value) internal {
        adminApprovalThreshold = value;
        emit ConfigUpdated("ADMIN_THRESHOLD", value);
    }

    function _setPlatformFee(uint256 value) internal {
        require(value <= MAX_FEE_BPS, "Fee too high");
        platformFeeBps = value;
        emit ConfigUpdated("PLATFORM_FEE", value);
    }

    function _setRefundWindow(uint256 value) internal {
        require(value >= 1 hours, "Too small");
        refundWindow = value;
        emit ConfigUpdated("REFUND_WINDOW", value);
    }

    function _setRiskThreshold(uint256 value) internal {
        require(value <= 100, "Invalid risk");
        riskThreshold = value;
        emit ConfigUpdated("RISK_THRESHOLD", value);
    }
}