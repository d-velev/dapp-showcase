import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import SubmitDappView from '../views/submit-dapp/SubmitDappView.vue'


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
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
