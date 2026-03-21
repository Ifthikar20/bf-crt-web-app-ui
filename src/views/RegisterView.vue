<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api'

const router = useRouter()
const email = ref('')
const password = ref('')
const displayName = ref('')
const loading = ref(false)
const error = ref(null)

async function handleRegister() {
  error.value = null
  if (password.value.length < 8) { error.value = 'Password must be at least 8 characters'; return }
  loading.value = true
  try {
    const { data } = await authApi.register(email.value, password.value, displayName.value)
    localStorage.setItem('creator_token', data.token)
    localStorage.setItem('creator_user', JSON.stringify(data.user))
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed'
  } finally {
    loading.value = false
  }
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
        <p>Create your Creator Account</p>
      </div>

      <div v-if="error" class="login-error">{{ error }}</div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Display Name</label>
          <input v-model="displayName" type="text" class="form-input" placeholder="Your name" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="you@example.com" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-input" placeholder="Min 8 characters" required autocomplete="new-password" />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <p style="text-align:center; margin-top:16px; color: var(--text-secondary); font-size:14px">
        Already have an account? <router-link to="/login" style="color: var(--primary);">Sign in</router-link>
      </p>
    </div>
  </div>
</template>
