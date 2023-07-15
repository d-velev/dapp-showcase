import Web3 from 'web3';
import Showcase from '../../build/contracts/Showcase.json';

const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(Showcase.abi, "0x4C593969eB8a1a203D509f1f8fB7E7d17A3111Eb");

export function useContract() {
    const submitDapp = async (address) => {
        const account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0]
        return contract.methods.submitDapp(address).send({ from: account });
    }

    return { submitDapp }
}