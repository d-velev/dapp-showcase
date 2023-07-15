const Showcase = artifacts.require("Showcase");

contract("Showcase", (accounts) => {
    it("should add a new dapp hash only once", async () => {
        const showcaseInstance = await Showcase.deployed();
        await showcaseInstance.submitDapp("Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu", { from: accounts[0], value: 1 })
        const dapp = await showcaseInstance.pendingDapps("Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu")

        expect(dapp.isInitialized).to.be.true

        try {
            await showcaseInstance.submitDapp("Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu")
        } catch (error) {
            assert.equal(error.data.reason, "Dapp with this address already pending or approved")
        }
    });
    it("should fail if minimum deposit isn't given", async () => {
        const showcaseInstance = await Showcase.deployed();

        try {
            await showcaseInstance.submitDapp("QmNrgEMcUygbKzZeZgYFosdd27VE9KnWbyUD73bKZJ3bGi")
        } catch (error) {
            assert.equal(error.data.reason, "Transaction must include the minimum deposit")
        }
    });
});