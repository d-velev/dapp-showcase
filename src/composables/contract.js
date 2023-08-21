import Web3 from 'web3';
import Showcase from '../../build/contracts/Showcase.json';

const web3 = new Web3(window.ethereum);
const contractAddress = "contract address placeholder"
const contract = new web3.eth.Contract(Showcase.abi, contractAddress);

export function useContract() {
    const submitDapp = async (address) => {
        const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]

        return contract.methods.submitDapp(address).send({ from: account, value: 1 });
    }

    const getPendingDappAddresses = () => {
        return contract.methods.getPendingDappAddresses().call()
    }

    const hasVotedForDapp = async (ipfsAddress) => {
        const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        return contract.methods.hasVotedForDapp(account, ipfsAddress).call()
    }

    const hasSubmittedVoteForDapp = async (ipfsAddress) => {
        const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        return contract.methods.hasSubmittedVoteForDapp(account, ipfsAddress).call()
    }

    const vote = async (address, amount, commitmentHash) => {
        const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        return contract.methods.vote(address, commitmentHash).send({ from: account, value: amount });
    }

    const submitVote = async (address, voteOption, salt) => {
        const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
        return contract.methods.submitCommitment(address, voteOption, salt).send({ from: account });
    }

    const finalizeDapp = async (address) => {
        const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];

        return contract.methods.finalizeDapp(address).send({ from: account });
    }

    const getApprovedDappAddresses = () => {
        return contract.methods.getApprovedDappAddresses().call()
    }

    return { submitDapp, getPendingDappAddresses, vote, submitVote, hasVotedForDapp, finalizeDapp, getApprovedDappAddresses, hasSubmittedVoteForDapp }
}