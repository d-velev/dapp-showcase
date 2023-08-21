
# Dapp showcase

  ## Project overview

This project aims to serve as a decentralized dappstore to Ethereum based chains. It provides users in the ecosystem a way to democratically decide which dapps should be listed. This is achieved through secret voting with a few steps:
- A user submits a new dapp that is listed in the voting page. That user also deposits a fixed amount of tokens that act as a spam filter.
- Other users may vote for the dapp with either approve or reject and some amount of tokens. This initial vote sends only a commitment hash which keeps the vote selection secret.
- In the next phase, users that have voted for the dapp can submit their vote by revealing their vote option and the salt that was used for the forming of the commitment hash.
- In the third and final phase an arbitrary user may finalize the voting process which distributes the total sum of tokens that were used for voting among the winning group.

The idea behind this voting mechanism is to incentivize users to vote sincerely. If the voting isn't done in secret, users could see which group is more likely to win and skew the votes in that direction. Ideally, users will vote purely based on their judgement of the dapp.

The change of phases is done based on blocks. A static integer in the contract determines how many blocks each phase will last.

Dapps that are being submitted have to include a name, description, contract address, website and logo. These fields are of course subject to change. All of this data is stored in IPFS.

  ## Stack and Consensys products used
  Vue.js, IPFS, Truffle, Infura, Linea, Metamask

Most of the development was done with the help of the `truffle develop` local network. The contract was deployed on Linea at some point [here](https://explorer.goerli.linea.build/address/0x11505BE405220797F834Ce31d038b389d985d5cA), but I cannot seem to be able to deploy at the moment of writing this. During the testing with Linea I ran into issues with gas for some transactions after which I returned to testing with the local network.
  

## Running the project locally
The project requires a running local IPFS node. It can be installed by following [this guide](https://docs.ipfs.tech/install/command-line/) and started with `ipfs daemon`. The Vue.js frontend can be started with the following command: `npm install && npm run serve`

This requires Node.js. I am truly sorry for the unpolished setup but I didn't have time to do any docker stuff.

The contract address is hardcoded in `src/composables/conctract.js/` 