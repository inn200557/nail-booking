import { createRouter, createWebHistory } from 'vue-router'
import Customer from '../views/Customer.vue'
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/', component: Customer },
  { path: '/admin', component: Admin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
