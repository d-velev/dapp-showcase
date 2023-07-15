<template>
  <div class="home">
    <v-container>
      <v-row no-gutters>
        <v-col cols="5" class="landing-text">
          <p class="title">Dapp showcase</p>
          <p class="subtitle">discover popular and newly emerging dapps</p>
          <div class="buttons">
            <RouterLink to="/submit-dapp">
              <v-btn rounded="0" color="red" size="large" variant="flat" class="landing-btn text-black">
                submit dapp
              </v-btn>
            </RouterLink>
            <v-btn rounded="0" color="red" size="large" variant="flat" class="landing-btn text-black">
              vote for dapps
            </v-btn>
          </div>
        </v-col>
        <v-col cols="7" class="eth-img-container">
          <img src="../../assets/eth.png" class="eth-img">
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>

export default {
  name: 'HomeView',
}

</script>

<style src="./home.scss" lang="scss" />
