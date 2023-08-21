<template>
  <v-app>
    <v-app-bar elevation="3" height="90">
      <template v-slot:prepend>
        <router-link to="/" class="ml-8"><img src="../src/assets/logo.png" width="35"></router-link>
      </template>
      <v-list>
        <router-link to="/"><v-chip variant="outlined" color="black" class="mx-2" link>home</v-chip></router-link>
        <router-link to="/submit-dapp"><v-chip variant="outlined" color="black" class="mr-2" link>submit
            dapp</v-chip></router-link>
        <router-link to="/voting"><v-chip variant="outlined" color="black" link>voting</v-chip></router-link>
      </v-list>
      <template v-slot:append>
        <v-btn v-if="!account" variant="flat" color="black" rounded v-on:click="connect">
          Connect
        </v-btn>
        <p v-else class="account mr-3">Connected with account: {{ getShortenedAccount() }}</p>
      </template>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
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
