// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PolicyContract {
    struct Policy {
        address holder;
        uint64 threshold;
        uint256 premium;
        uint256 coverage;
        uint256 reportedValue;
        bytes32 reportHash;
        bool active;
        bool paid;
    }

    mapping(uint256 => Policy) public policies;
    uint256 public policyCount;
    address public oracle;
    address public owner;

    event PolicyPurchased(uint256 indexed policyId, address indexed holder, uint256 premium, uint256 coverage, uint64 threshold);
    event RainfallReported(uint256 indexed policyId, uint256 reportedValue, bytes32 reportHash);
    event PolicySettled(uint256 indexed policyId, address indexed holder, uint256 payout);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }

    constructor() {
        owner = msg.sender;
        oracle = msg.sender; // Initially, owner is also oracle
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    function buy(uint64 threshold, uint256 coverage) external payable {
        require(msg.value > 0, "Premium must be greater than 0");
        require(coverage > 0, "Coverage must be greater than 0");
        require(threshold > 0, "Threshold must be greater than 0");

        policyCount++;
        policies[policyCount] = Policy({
            holder: msg.sender,
            threshold: threshold,
            premium: msg.value,
            coverage: coverage,
            reportedValue: 0,
            reportHash: bytes32(0),
            active: true,
            paid: false
        });

        emit PolicyPurchased(policyCount, msg.sender, msg.value, coverage, threshold);
    }

    function report(uint256 id, uint256 value, bytes32 reportHash) external onlyOracle {
        require(id > 0 && id <= policyCount, "Invalid policy ID");
        require(policies[id].active, "Policy not active");
        require(policies[id].reportedValue == 0, "Already reported");

        policies[id].reportedValue = value;
        policies[id].reportHash = reportHash;

        emit RainfallReported(id, value, reportHash);
    }

    function settle(uint256 id) external {
        require(id > 0 && id <= policyCount, "Invalid policy ID");
        Policy storage policy = policies[id];
        
        require(policy.active, "Policy not active");
        require(!policy.paid, "Already paid");
        require(policy.reportedValue > 0, "No rainfall reported");
        require(policy.reportedValue < policy.threshold, "Rainfall above threshold, no payout");

        policy.paid = true;
        policy.active = false;

        (bool success, ) = policy.holder.call{value: policy.coverage}("");
        require(success, "Payout failed");

        emit PolicySettled(id, policy.holder, policy.coverage);
    }

    function getPolicy(uint256 id) external view returns (Policy memory) {
        require(id > 0 && id <= policyCount, "Invalid policy ID");
        return policies[id];
    }

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function fundContract() external payable {}
}
