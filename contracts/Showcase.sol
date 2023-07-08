// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Showcase {
    uint private constant MINIMUM_DEPOSIT = 1 wei;
    uint private constant BLOCKS_PER_VOTING_PERIOD = 1;

    struct Vote {
        bytes32 commitmentHash;
        uint amount;
    }

    struct VoteGroup {
        address[] addresses;
        uint totalVotes;
    }

    struct SubmittedVotes {
        VoteGroup approve;
        VoteGroup reject;
    }

    struct PendingDapp {
        bool isInitialized;
        address owner;
        uint deposit;
        uint submissionHeight;
        uint rewardPool;
        mapping(address => Vote) voters;
        SubmittedVotes submittedVotes;
    }

    mapping(bytes32 => PendingDapp) public pendingDapps;
    mapping(bytes32 => bool) public approvedDapps;

    function submitDapp(bytes32 ipfsHash) public payable {
        require(
            !(approvedDapps[ipfsHash] || pendingDapps[ipfsHash].isInitialized),
            "Dapp with this hash already pending or approved"
        );

        require(
            msg.value >= MINIMUM_DEPOSIT,
            "Transaction must include the minimum deposit"
        );

        PendingDapp storage pendingDapp = pendingDapps[ipfsHash];
        pendingDapp.isInitialized = true;
        pendingDapp.owner = msg.sender;
        pendingDapp.deposit = msg.value;
        pendingDapp.submissionHeight = block.number;
        pendingDapp.rewardPool = 0;
    }
}
