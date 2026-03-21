import { defineStore } from 'pinia'
import { authApi } from './api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('creator_user') || 'null'),
        token: localStorage.getItem('creator_token') || null,
        loading: false,
        error: null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        displayName: (state) => state.user?.display_name || state.user?.email || 'Creator',
    },

    actions: {
        async login(email, password) {
            this.loading = true
            this.error = null
            try {
                const { data } = await authApi.login(email, password)
                this.token = data.token
                this.user = data.user
                localStorage.setItem('creator_token', data.token)
                localStorage.setItem('creator_user', JSON.stringify(data.user))
                return true
            } catch (err) {
                this.error = err.response?.data?.error || err.response?.data?.detail || 'Login failed'
                return false
            } finally {
                this.loading = false
            }
        },

        async fetchMe() {
            if (!this.token) return
            try {
                const { data } = await authApi.me()
                this.user = data.user
                localStorage.setItem('creator_user', JSON.stringify(data.user))
            } catch {
                this.logout()
            }
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('creator_token')
            localStorage.removeItem('creator_user')
        },
    },
})
