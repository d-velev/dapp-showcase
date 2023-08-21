// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Showcase {
    uint private constant MINIMUM_DEPOSIT = 1 wei;
    uint private constant BLOCKS_PER_VOTING_PERIOD = 1;
    uint private constant VOTER_REWARD_POOL_PERCENTAGE = 99;
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

    struct PendingDappPeriod {
        string ipfsAddress;
        string period;
    }

    string[] pendingDappAddresses;
    mapping(string => PendingDapp) public pendingDapps;

    string[] approvedDappAddresses;

    function getApprovedDappAddresses() public view returns (string[] memory) {
        return approvedDappAddresses;
    }

    function getPendingDappAddresses()
        public
        view
        returns (PendingDappPeriod[] memory)
    {
        uint arrayLen = pendingDappAddresses.length;
        PendingDappPeriod[] memory dappsWithPeriod = new PendingDappPeriod[](
            arrayLen
        );
        for (uint256 i = 0; i < arrayLen; ++i) {
            PendingDappPeriod memory dapp;
            PendingDapp storage pendingDapp = pendingDapps[
                pendingDappAddresses[i]
            ];
            if (pendingDapp.isInitialized) {
                dapp.ipfsAddress = pendingDappAddresses[i];
                dapp.period = calculateCurrentDappPeriod(
                    pendingDapp.submissionHeight
                );
                dappsWithPeriod[i] = dapp;
            }
        }
        return dappsWithPeriod;
    }

    function hasVotedForDapp(
        address adr,
        string memory ipfsAddress
    ) public view returns (bool) {
        PendingDapp storage pendingDapp = pendingDapps[ipfsAddress];

        return pendingDapp.voters[adr].amount > 0;
    }

    function hasSubmittedVoteForDapp(
        address adr,
        string memory ipfsAddress
    ) public view returns (bool) {
        PendingDapp storage pendingDapp = pendingDapps[ipfsAddress];

        return pendingDapp.voters[adr].isConfirmed;
    }

    function submitDapp(string memory ipfsAddress) public payable {
        require(
            !pendingDapps[ipfsAddress].isInitialized,
            "Dapp with this address already pending"
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

    function finalizeDapp(string memory ipfsAddress) public {
        PendingDapp storage pendingDapp = pendingDapps[ipfsAddress];

        uint voterRewardPool = percent(
            pendingDapp.rewardPool + pendingDapp.deposit,
            VOTER_REWARD_POOL_PERCENTAGE
        );
        uint updaterReward = pendingDapp.rewardPool +
            pendingDapp.deposit -
            voterRewardPool;

        // 1% of the total reward pool goes to the updater as an incentive
        payable(msg.sender).transfer(updaterReward);

        if (
            pendingDapp.submittedVotes.approve.totalVotes >
            pendingDapp.submittedVotes.reject.totalVotes
        ) {
            approvedDappAddresses.push(ipfsAddress);
            distributeRewards(
                pendingDapp.submittedVotes.approve.addresses,
                pendingDapp.voters,
                voterRewardPool,
                pendingDapp.submittedVotes.approve.totalVotes
            );
        } else {
            distributeRewards(
                pendingDapp.submittedVotes.reject.addresses,
                pendingDapp.voters,
                voterRewardPool,
                pendingDapp.submittedVotes.reject.totalVotes
            );
        }

        pendingDapp.isInitialized = false;
    }

    function distributeRewards(
        address[] storage winningAddresses,
        mapping(address => Vote) storage voters,
        uint totalRewardPool,
        uint winningGroupPool
    ) private {
        uint arrayLen = winningAddresses.length;

        for (uint256 i = 0; i < arrayLen; ++i) {
            uint voterAmount = voters[winningAddresses[i]].amount;
            uint voterPercentage = (voterAmount * 100) / winningGroupPool;
            uint voterReward = percent(totalRewardPool, voterPercentage);
            payable(winningAddresses[i]).transfer(voterReward);
        }
    }

    function percent(uint value, uint percentage) private pure returns (uint) {
        return (value * percentage) / 100;
    }

    function calculateCurrentDappPeriod(
        uint submissionHeight
    ) private view returns (string memory) {
        uint blockNumber = block.number;
        if (
            blockNumber >= submissionHeight &&
            blockNumber < submissionHeight + BLOCKS_PER_VOTING_PERIOD
        ) {
            return "vote";
        } else if (
            blockNumber >= submissionHeight + BLOCKS_PER_VOTING_PERIOD &&
            blockNumber < submissionHeight + BLOCKS_PER_VOTING_PERIOD * 2
        ) {
            return "submit";
        } else {
            return "finalize";
        }
    }
}
