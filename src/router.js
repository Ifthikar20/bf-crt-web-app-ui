import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('./views/LoginView.vue'),
        meta: { guest: true },
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('./views/RegisterView.vue'),
        meta: { guest: true },
    },
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('./views/DashboardView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/content',
        name: 'Content',
        component: () => import('./views/ContentListView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/content/new',
        name: 'ContentNew',
        component: () => import('./views/ContentUploadView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/content/:id/edit',
        name: 'ContentEdit',
        component: () => import('./views/ContentUploadView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('./views/ProfileView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/series',
        name: 'Series',
        component: () => import('./views/SeriesView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/earnings',
        name: 'Earnings',
        component: () => import('./views/EarningsView.vue'),
        meta: { requiresAuth: true },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Auth guard
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('creator_token')
    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else if (to.meta.guest && token) {
        next('/')
    } else {
        next()
    }
})

export default router
