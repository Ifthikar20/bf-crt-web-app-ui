<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

async function handleLogin() {
  const success = await auth.login(email.value, password.value)
  if (success) router.push('/')
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" width="26" height="26" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1>BetterFeel</h1>
        <p>Sign in to your Creator Portal</p>
      </div>

      <div v-if="auth.error" class="login-error">{{ auth.error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="you@example.com" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-input" placeholder="Enter your password" required autocomplete="current-password" />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px" :disabled="auth.loading">
          <span v-if="auth.loading" class="spinner"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <p style="text-align:center; margin-top:16px; color: var(--text-secondary); font-size:14px">
        Don't have an account? <router-link to="/register" style="color: var(--primary);">Create one</router-link>
      </p>
    </div>
  </div>
</template>
