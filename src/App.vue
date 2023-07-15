<template>
  <nav>
  </nav>
  <div class="connect">
    <v-btn v-if="!account" rounded color="blue" class="connect-btn" v-on:click="connect">
      Connect to MetaMask
    </v-btn>
    <p v-else class="account">Connected with account: {{ getShortenedAccount() }}</p>
  </div>
  <router-view />
</template>

<script>

export default {
  data() {
    return {
      account: undefined
    }
  },
  methods: {
    async connect() {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        .catch((err) => {
          if (err.code === 4001) {
            console.log('Please connect to MetaMask.');
          } else {
            console.error(err);
          }
        });

      if (accounts) {
        this.account = accounts[0]
      }
    }
    ,
    getShortenedAccount() {
      return this.account.substring(0, 5) + "..." + this.account.substring(38, 42)
    }
  },

  mounted() {
    this.connect()
  }
}

</script>

<style src="./app.scss" lang="scss" />
