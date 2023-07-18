// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Showcase {
    uint private constant MINIMUM_DEPOSIT = 1 wei;
    uint private constant BLOCKS_PER_VOTING_PERIOD = 2;
    bytes1 private constant VOTE_OPTION_REJECT = 0x00;
    bytes1 private constant VOTE_OPTION_APPROVE = 0x01;

    struct Vote {
        bytes32 commitmentHash;
        uint amount;
        bool isConfirmed;
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
        bytes32 commitmentHash
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
            "Sender has already voted"
        );

        require(commitmentHash.length == 32, "Malformed commitment hash");

        require(msg.value > 0, "Vote amount has to be positive");

        pendingDapp.rewardPool += msg.value;
        pendingDapp.voters[msg.sender].amount += msg.value;
        pendingDapp.voters[msg.sender].commitmentHash = commitmentHash;
    }

    function submitCommitment(
        string memory ipfsAddress,
        bytes1 voteOption,
        bytes32 salt
    ) public {
        PendingDapp storage pendingDapp = pendingDapps[ipfsAddress];

        require(
            pendingDapp.isInitialized &&
                (block.number >=
                    pendingDapp.submissionHeight + BLOCKS_PER_VOTING_PERIOD &&
                    block.number <=
                    pendingDapp.submissionHeight +
                        BLOCKS_PER_VOTING_PERIOD *
                        2),
            "Dapp not in commitment submission period or pending"
        );

        require(
            pendingDapp.voters[msg.sender].amount > 0,
            "Sender hasn't voted for this dapp"
        );

        require(
            !pendingDapp.voters[msg.sender].isConfirmed,
            "Sender has already confirmed his vote"
        );

        require(
            voteOption == VOTE_OPTION_APPROVE ||
                voteOption == VOTE_OPTION_REJECT,
            "Invalid vote option, has to be either approve (0x01) or reject (0x00)"
        );

        require(
            keccak256(bytes.concat(voteOption, salt)) ==
                pendingDapp.voters[msg.sender].commitmentHash,
            "Commitment hash mismatch"
        );

        if (voteOption == VOTE_OPTION_APPROVE) {
            pendingDapp.submittedVotes.approve.addresses.push(msg.sender);
            pendingDapp.submittedVotes.approve.totalVotes += pendingDapp
                .voters[msg.sender]
                .amount;
        } else {
            pendingDapp.submittedVotes.reject.addresses.push(msg.sender);
            pendingDapp.submittedVotes.reject.totalVotes += pendingDapp
                .voters[msg.sender]
                .amount;
        }

        pendingDapp.voters[msg.sender].isConfirmed = true;
    }
}
