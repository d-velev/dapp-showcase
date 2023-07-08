const Showcase = artifacts.require("Showcase");

contract("Showcase", (accounts) => {
    it("should add a new dapp hash only once", async () => {
        const showcaseInstance = await Showcase.deployed();
        await showcaseInstance.submitDapp("0x1234", { from: accounts[0], value: 1 })
        const dapp = await showcaseInstance.pendingDapps("0x1234")

        expect(dapp.isInitialized).to.be.true

        try {
            await showcaseInstance.submitDapp("0x1234")
        } catch (error) {
            assert.equal(error.data.reason, "Dapp with this hash already pending or approved")
        }
    });
    it("should fail if minimum deposit isn't given", async () => {
        const showcaseInstance = await Showcase.deployed();

        try {
            await showcaseInstance.submitDapp("0x12345")
        } catch (error) {
            assert.equal(error.data.reason, "Transaction must include the minimum deposit")
        }
    });
});