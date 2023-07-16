// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Showcase {
    uint private constant MINIMUM_DEPOSIT = 1 wei;
    uint private constant BLOCKS_PER_VOTING_PERIOD = 2;

    struct Vote {
        bytes commitmentHash;
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

    string[] pendingDappAddresses;
    mapping(string => PendingDapp) public pendingDapps;

    mapping(string => bool) public approvedDapps;

    function getPendingDappAddresses() public view returns (string[] memory) {
        return pendingDappAddresses;
    }

    function submitDapp(string memory ipfsAddress) public payable {
        require(
            !(approvedDapps[ipfsAddress] ||
                pendingDapps[ipfsAddress].isInitialized),
            "Dapp with this address already pending or approved"
        );

        require(
            msg.value >= MINIMUM_DEPOSIT,
            "Transaction must include the minimum deposit"
        );

        PendingDapp storage pendingDapp = pendingDapps[ipfsAddress];
        pendingDapp.isInitialized = true;
        pendingDapp.owner = msg.sender;
        pendingDapp.deposit = msg.value;
        pendingDapp.submissionHeight = block.number;
        pendingDapp.rewardPool = 0;
        pendingDappAddresses.push(ipfsAddress);
    }

    function vote(
        string memory ipfsAddress,
        string memory commitmentHash
    ) public payable {
        PendingDapp storage pendingDapp = pendingDapps[ipfsAddress];

        require(
            pendingDapp.isInitialized &&
                (block.number >= pendingDapp.submissionHeight &&
                    block.number <=
                    pendingDapp.submissionHeight + BLOCKS_PER_VOTING_PERIOD),
            "Dapp not in voting period or pending"
        );
        require(
            pendingDapp.voters[msg.sender].amount == 0,
            "Address has already voted"
        );
        require(
            bytes(commitmentHash).length == 66,
            "Malformed commitment hash"
        );
        require(msg.value > 0, "Vote amount has to be positive");

        pendingDapp.rewardPool += msg.value;
        pendingDapp.voters[msg.sender].amount += msg.value;
        pendingDapp.voters[msg.sender].commitmentHash = bytes(commitmentHash);
    }
}
