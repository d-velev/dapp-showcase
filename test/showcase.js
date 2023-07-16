const Showcase = artifacts.require("Showcase");

contract("Showcase", (accounts) => {
    const ipfsAddress = "Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu"

    it("should add a new dapp hash only once", async () => {
        const showcaseInstance = await Showcase.new();
        await showcaseInstance.submitDapp(ipfsAddress, { from: accounts[0], value: 1 })
        const dapp = await showcaseInstance.pendingDapps(ipfsAddress)

        expect(dapp.isInitialized).to.be.true

        try {
            await showcaseInstance.submitDapp(ipfsAddress)
        } catch (error) {
            assert.equal(error.data.reason, "Dapp with this address already pending or approved")
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
            assert.equal(error.data.reason, "Address has already voted")
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
});