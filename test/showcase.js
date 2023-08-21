const Showcase = artifacts.require("Showcase");

contract("Showcase", (accounts) => {
    const ipfsAddress = "Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu"

    describe("submitDapp", function () {
        it("should add a new dapp hash only once", async () => {
            const showcaseInstance = await Showcase.new();
            await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })
            const dapp = await showcaseInstance.pendingDapps(ipfsAddress)

            expect(dapp.isInitialized).to.be.true

            try {
                await showcaseInstance.submitDapp(ipfsAddress)
            } catch (error) {
                assert.equal(error.data.reason, "Dapp with this address already pending")
            }
        });
        it("should fail if minimum deposit isn't given", async () => {
            const showcaseInstance = await Showcase.new();

            try {
                await showcaseInstance.submitDapp(ipfsAddress)
            } catch (error) {
                assert.equal(error.data.reason, "Transaction must include the minimum deposit")
            }
        });
    })
    describe("vote", function () {
        it("should be able to vote for a dapp only once", async () => {
            const showcaseInstance = await Showcase.new();

            await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })

            const commitmentHash = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

            await showcaseInstance.vote(ipfsAddress, commitmentHash, { from: accounts[0], value: 1 })

            const dapp = await showcaseInstance.pendingDapps(ipfsAddress)

            expect(dapp.rewardPool.toNumber()).to.equal(1)

            try {
                await showcaseInstance.vote(ipfsAddress, commitmentHash, { from: accounts[0], value: 1 })
            } catch (error) {
                assert.equal(error.data.reason, "Sender has already voted")
            }
        });
        it("should fail if commitment hash is malformed", async () => {
            const showcaseInstance = await Showcase.new();

            await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })

            const commitmentHash = "0xabc";

            try {
                await showcaseInstance.vote(ipfsAddress, commitmentHash, { from: accounts[0], value: 1 })
            } catch (error) {
                assert.equal(error.data.reason, "Malformed commitment hash")
            }
        });
        it("should fail if no transaction value is provided", async () => {
            const showcaseInstance = await Showcase.new();

            await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })

            const commitmentHash = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

            try {
                await showcaseInstance.vote(ipfsAddress, commitmentHash, { from: accounts[0], value: 0 })
            } catch (error) {
                assert.equal(error.data.reason, "Vote amount has to be positive")
            }
        });
    })
    describe("submitCommitment", function () {
        it("it should submit vote given the right vote option and salt", async () => {
            const showcaseInstance = await Showcase.new();

            await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })

            const commitmentHash = "0x248092f167c5d47499621b1b9f4c31c1759f24d6b078b007bdc18b539f7c569d";

            await showcaseInstance.vote(ipfsAddress, commitmentHash, { from: accounts[0], value: 10 })
            await advanceBlock()

            // 0x00 stands for reject
            await showcaseInstance.submitCommitment(ipfsAddress, "0x00", "0x84b6d330ece9a24eb9dc4589854ff8dfad0038c6bad339118c9bb8b3ad675c24")

            const dapp = await showcaseInstance.pendingDapps(ipfsAddress)

            expect(dapp.submittedVotes.reject.addresses.length).to.equal(1)
            expect(dapp.submittedVotes.reject.totalVotes).to.equal('10')

            expect(dapp.submittedVotes.approve.addresses.length).to.equal(0)
            expect(dapp.submittedVotes.approve.totalVotes).to.equal('0')

        });
        it("it should fail to submit if address hasn't voted or attempts to submit twice", async () => {
            const showcaseInstance = await Showcase.new();

            await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })

            const commitmentHash = "0x248092f167c5d47499621b1b9f4c31c1759f24d6b078b007bdc18b539f7c569d";

            await showcaseInstance.vote(ipfsAddress, commitmentHash, { from: accounts[0], value: 10 })
            await advanceBlock()

            try {
                // submit from another account
                await showcaseInstance.submitCommitment(ipfsAddress, "0x00", "0x84b6d330ece9a24eb9dc4589854ff8dfad0038c6bad339118c9bb8b3ad675c24", { from: accounts[1] })
            } catch (error) {
                assert.equal(error.data.reason, "Sender hasn't voted for this dapp")
            }

            await showcaseInstance.submitCommitment(ipfsAddress, "0x00", "0x84b6d330ece9a24eb9dc4589854ff8dfad0038c6bad339118c9bb8b3ad675c24")

            try {
                // attempt to submit twice
                await showcaseInstance.submitCommitment(ipfsAddress, "0x00", "0x84b6d330ece9a24eb9dc4589854ff8dfad0038c6bad339118c9bb8b3ad675c24")
            } catch (error) {
                assert.equal(error.data.reason, "Sender has already confirmed his vote")
            }
        });
        it("it should fail to submit if given an incorrect vote option", async () => {
            const showcaseInstance = await Showcase.new();

            await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })

            const commitmentHash = "0x248092f167c5d47499621b1b9f4c31c1759f24d6b078b007bdc18b539f7c569d";

            await showcaseInstance.vote(ipfsAddress, commitmentHash, { from: accounts[0], value: 10 })
            await advanceBlock()

            try {
                // vote option is either 0x00 or 0x01
                await showcaseInstance.submitCommitment(ipfsAddress, "0x02", "0x84b6d330ece9a24eb9dc4589854ff8dfad0038c6bad339118c9bb8b3ad675c24")
            } catch (error) {
                assert.equal(error.data.reason, "Invalid vote option, has to be either approve (0x01) or reject (0x00)")
            }
        });
        it("it should fail to submit if given a vote + salt that doesn't match the original commitment", async () => {
            const showcaseInstance = await Showcase.new();

            await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })

            // this is 0x00 + salt
            const commitmentHash = "0x248092f167c5d47499621b1b9f4c31c1759f24d6b078b007bdc18b539f7c569d";

            await showcaseInstance.vote(ipfsAddress, commitmentHash, { from: accounts[0], value: 10 })
            await advanceBlock()

            try {
                // attempt to submit 0x01
                await showcaseInstance.submitCommitment(ipfsAddress, "0x01", "0x84b6d330ece9a24eb9dc4589854ff8dfad0038c6bad339118c9bb8b3ad675c24")
            } catch (error) {
                assert.equal(error.data.reason, "Commitment hash mismatch")
            }
        });
    })

    function advanceBlock() {
        return new Promise((resolve, reject) => {
            web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'evm_mine',
                id: new Date().getTime()
            }, (err, result) => {
                if (err) { return reject(err) }
                const newBlockHash = web3.eth.getBlock('latest').hash

                return resolve(newBlockHash)
            })
        })
    }

});