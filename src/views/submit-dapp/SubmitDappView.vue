<template>
    <meta name="referrer" content="no-referrer" />
    <div class="form">
        <p class="submit-text">Submit a new dapp</p>
        <v-form v-model="isFormValid" class="text-xs-center">
            <v-text-field v-model="name" :rules="[required, minLength(3)]" maxLength="20" label="Name"
                class="form-item"></v-text-field>

            <v-text-field v-model="description" :rules="[required, minLength(10)]" maxLength="100" label="Description"
                class="form-item"></v-text-field>

            <v-text-field v-model="contractAddress" :rules="[required, minLength(41)]" maxLength="42"
                label="Contract address" class="form-item"></v-text-field>

            <v-text-field v-model="website" :rules="[required, isURL]" maxLength="50" label="Website URL"
                class="form-item"></v-text-field>

            <v-file-input :rules="[logoAdded]" hide-input v-model="logoFile" prepend-icon="" accept="image/*" label="Logo"
                @change="setLogo" class="form-item"></v-file-input>

            <div class="img-border">
                <v-img :src=logo max-height="200" />
            </div>

            <v-btn v-if="!submitInProgress" :disabled="!isFormValid" color="black" v-on:click="submitDapp">
                submit
            </v-btn>
            <v-progress-circular v-else indeterminate></v-progress-circular>
        </v-form>
    </div>
</template>

<script>

import { useIpfs } from "../../composables/ipfs.js"
import { useContract } from "../../composables/contract.js"
const { add } = useIpfs();

export default {
    name: 'SubmitDappView',
    data() {
        return {
            name: "",
            description: "",
            contractAddress: "",
            website: "",
            logoFile: undefined,
            logo: undefined,
            submitInProgress: false,
            isFormValid: false,
        };
    },
    methods: {
        logoAdded() {
            return this.logo != undefined
        },
        minLength(min) {
            return v => (v || '').length > min || 'Too short';
        },
        required(v) {
            return !!v || 'Field is required'
        },
        isURL(str) {
            let url;
            try {
                url = new URL(str);
            } catch (_) {
                return "Invalid URL";
            }

            return url.protocol === "http:" || url.protocol === "https:";
        },

        setLogo() {
            const file = this.logoFile[0]
            const reader = new FileReader();

            reader.onloadend = () => {
                this.logo = reader.result;
            }

            if (file) {
                reader.readAsDataURL(file);
            } else {
                this.logo = undefined;
            }
        },
        async submitDapp() {
            this.submitInProgress = true;
            // const { add } = await useIpfs();
            const { submitDapp } = useContract();

            const dapp = { name: this.name, description: this.description, contractAddress: this.contractAddress, website: this.website, logo: this.logo }
            add(dapp).then(address => {
                submitDapp(address.cid.toString())
                    .then(() => {
                        this.submitInProgress = false;
                    })
                    .catch(error => {
                        console.error(error)
                        this.submitInProgress = false;
                    })
            })
        }
    }
}
</script>

<style src="./submit-dapp.scss" lang="scss" />
