import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import SubmitDappView from '../views/submit-dapp/SubmitDappView.vue'
import VotingView from '../views/voting/VotingView.vue'


const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/submit-dapp',
        name: 'submit-dapp',
        component: SubmitDappView
    },
    {
        path: '/voting',
        name: 'voting',
        component: VotingView
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
