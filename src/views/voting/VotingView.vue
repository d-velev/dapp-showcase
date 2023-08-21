<template>
    <div>
        <v-container fluid>
            <p class="voting-text text-left">Dapps currently up for voting</p>
            <v-divider class="main-divider"></v-divider>
            <p v-if="dapps.length == 0" class="text-left">There are currently no dapps up for voting</p>
            <v-row v-else>
                <v-col v-for="dapp in dapps" :key="dapp" cols="12" sm="4">
                    <v-hover>
                        <template v-slot:default="{ isHovering, props }">
                            <v-card v-bind="props" class="rounded-xl" variant="outlined" :elevation="isHovering ? 5 : 0">
                                <v-row align="center" no-gutters>
                                    <v-col cols="6">
                                        <v-img class="ma-3 rounded-xl logo" :src="dapp.logo" width="100px"></v-img>
                                    </v-col>

                                    <v-col cols="6" class="text-right">
                                        <v-chip size="large" class="ma-4" color="red" variant="flat">
                                            {{ dapp.period }}
                                        </v-chip>
                                    </v-col>
                                </v-row>
                                <v-card-item :title="dapp.name">
                                    <template v-slot:subtitle>
                                        {{ dapp.description }}
                                    </template>
                                </v-card-item>

                                <v-card-text class="py-1">
                                    Website: <a :href="dapp.website">{{ dapp.website }}</a>
                                </v-card-text>
                                <v-card-text class="py-1">
                                    Contract address: <a :href="dapp.website">{{ dapp.contractAddress }}</a>
                                </v-card-text>

                                <v-divider></v-divider>

                                <v-card-actions>
                                    <v-btn v-if="dapp.period == 'vote'" block rounded variant="outlined" color="black"
                                        :disabled="dapp.hasVoted">
                                        {{ dapp.hasVoted ? 'You have already voted' : 'Vote for this dapp'
                                        }}
                                        <v-dialog v-model="dialog" activator="parent" width="auto">
                                            <v-card>
                                                <v-card-title>
                                                    Voting for {{ dapp.name }}
                                                </v-card-title>
                                                <v-card-text>
                                                    <v-radio-group v-model="voteOption" inline>
                                                        <v-radio label="Approve" value="0x01"></v-radio>
                                                        <v-radio label="Reject" value="0x00"></v-radio>
                                                    </v-radio-group>
                                                    <v-text-field label="Vote amount" v-model="voteAmount" hide-details
                                                        single-line type="number" />
                                                    <v-btn @click="voteForDapp(dapp.address)" block rounded color="red"
                                                        variant="outlined" class="mt-4">Vote</v-btn>

                                                </v-card-text>
                                            </v-card>
                                        </v-dialog>
                                    </v-btn>
                                    <v-btn v-else-if="dapp.period == 'submit'"
                                        :disabled="!dapp.hasVoted || dapp.hasSubmittedVote" block rounded variant="outlined"
                                        color="black" v-on:click="submitVote(dapp.address)">
                                        {{ !dapp.hasVoted
                                            ||
                                            dapp.hasSubmittedVote ?
                                            "You haven't voted or already submitted" : 'Submit your vote'
                                        }}
                                    </v-btn>
                                    <v-btn v-else block rounded variant="outlined" color="black"
                                        v-on:click="finalizeDapp(dapp.address)">
                                        Finalize voting
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </template>
                    </v-hover>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>

import { useIpfs } from "../../composables/ipfs.js"
import { useContract } from "../../composables/contract.js"
import web3 from "web3";

export default {
    name: 'VotingView',
    data() {
        return {
            dapps: [],
            dialog: false,
            voteOption: "",
            voteAmount: 0
        }
    },
    async mounted() {
        const { getPendingDappAddresses } = useContract();
        const { get } = useIpfs();
        getPendingDappAddresses().then(addresses => {
            addresses.forEach(async ([address, period]) => {
                if (address) {
                    const dapp = await get(address);
                    dapp.period = period;
                    dapp.address = address;
                    dapp.hasVoted = await this.hasVotedForDapp(dapp.address);
                    dapp.hasSubmittedVote = await this.hasSubmittedVote(dapp.address);
                    this.dapps.push(dapp);
                }
            });
        })
    },
    methods: {
        voteForDapp(ipfsAddress) {
            const { vote } = useContract();
            const amount = this.voteAmount;
            const voteOption = this.voteOption;
            const salt = web3.utils.randomHex(32);
            const commitmentHash = web3.utils.soliditySha3(voteOption.replace("0x", "") + salt.replace("0x", ""));
            vote(ipfsAddress, amount, commitmentHash).then(() => {
                localStorage.setItem(ipfsAddress, JSON.stringify({ voteOption, salt, commitmentHash }))
                this.dialog = false;
            }).catch(err => console.error(err))
        },
        submitVote(ipfsAddress) {
            const { submitVote } = useContract();
            const { salt, voteOption } = JSON.parse(localStorage.getItem(ipfsAddress))
            submitVote(ipfsAddress, voteOption, salt).then(() => {
                console.log("success submitted your vote")
            }).catch(err => console.error(err))
        },
        finalizeDapp(ipfsAddress) {
            const { finalizeDapp } = useContract();
            finalizeDapp(ipfsAddress).then(() => {
                console.log("successfully finalized dapp")
            }).catch(err => console.error(err))
        },
        async hasVotedForDapp(ipfsAddress) {
            const { hasVotedForDapp } = useContract();
            return await hasVotedForDapp(ipfsAddress)
        },
        hasSubmittedVote(ipfsAddress) {
            const { hasSubmittedVoteForDapp } = useContract();
            return hasSubmittedVoteForDapp(ipfsAddress)
        }

    }
}
</script>

<style src="./voting.scss" lang="scss" />
