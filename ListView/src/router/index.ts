import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ApiViewTest from  '../views/ApiViewTest.vue'
import LocalityDetailView from '../views/LocalityDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
        path: '/',
        name: 'home',
        component: HomeView,
    },
    {
        path: '/test',
        name: 'test',
        component: ApiViewTest,
    },
    {
        path: '/localities/:id',
        name: 'locality-detail',
        component: LocalityDetailView,
        props: true,
    },
  ],
})

export default router