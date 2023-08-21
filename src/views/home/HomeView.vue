<template>
  <div class="home">
    <v-container>
      <v-row no-gutters>
        <v-col cols="5" class="landing-text">
          <p class="title">Dapp showcase</p>
          <p class="subtitle">discover popular and newly emerging dapps</p>
          <div class="buttons">
            <RouterLink to="/submit-dapp">
              <v-btn rounded="0" color="red" size="large" variant="flat" class="landing-btn">
                submit dapp
              </v-btn>
            </RouterLink>
            <RouterLink to="/voting">
              <v-btn rounded="0" color="red" size="large" variant="outlined" class="landing-btn">
                vote for dapps
              </v-btn>
            </RouterLink>
          </div>
        </v-col>
        <v-col cols="7">
          <!-- <img src="../../assets/eth.png" class="eth-img"> -->
          <img src="../../assets/eth.png" class="eth-img">
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid>
      <p class="approved-dapps-text text-left">Dapps approved by the community</p>
      <v-divider class="main-divider"></v-divider>
      <p v-if="dapps.length == 0" class="text-left">There are currently no approved dapps</p>
      <v-row v-else>
        <v-col v-for="dapp in dapps" :key="dapp" cols="12" sm="4">
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-card v-bind="props" class="rounded-xl" variant="outlined" :elevation="isHovering ? 5 : 0">
                <v-row align="center" no-gutters>
                  <v-col cols="12">
                    <v-img class="ma-3 rounded-xl logo" :src="dapp.logo" width="100px"></v-img>
                  </v-col>
                </v-row>
                <v-card-item :title="dapp.name">
                  <template v-slot:subtitle>
                    {{ dapp.description }}
                  </template>
                </v-card-item>

                <v-card-text>
                  Website: <a :href="dapp.website">{{ dapp.website }}</a>
                </v-card-text>
                <v-card-text class="mb-2">
                  Contract address: <a :href="dapp.website">{{ dapp.contractAddress }}</a>
                </v-card-text>
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

export default {
  name: 'HomeView',
  data() {
    return {
      dapps: []
    }
  },
  async mounted() {
    const { getApprovedDappAddresses } = useContract();
    const { get } = useIpfs();
    getApprovedDappAddresses().then(addresses => {
      addresses.forEach(async (address) => {
        if (address) {
          const dapp = await get(address);
          this.dapps.push(dapp);
        }
      });
    })
  },
}

</script>

<style src="./home.scss" lang="scss" />
