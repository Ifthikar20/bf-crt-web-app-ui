<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store'
import { authApi } from '../api'

const auth = useAuthStore()
const saving = ref(false)
const toast = ref(null)

const form = ref({
  display_name: '',
  bio: '',
  avatar_url: '',
  website: '',
  social_youtube: '',
  social_instagram: '',
  social_twitter: '',
})

onMounted(() => {
  if (auth.user) {
    form.value.display_name = auth.user.display_name || ''
    form.value.bio = auth.user.bio || ''
    form.value.avatar_url = auth.user.avatar_url || ''
    form.value.website = auth.user.website || ''
    form.value.social_youtube = auth.user.social_youtube || ''
    form.value.social_instagram = auth.user.social_instagram || ''
    form.value.social_twitter = auth.user.social_twitter || ''
  }
})

async function saveProfile() {
  saving.value = true
  try {
    const { data } = await authApi.updateProfile(form.value)
    if (data.user) {
      auth.user = data.user
      localStorage.setItem('creator_user', JSON.stringify(data.user))
    }
    showToast('Profile updated successfully!', 'success')
  } catch (err) {
    showToast('Failed to save profile.', 'error')
  } finally {
    saving.value = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { message, type }
  setTimeout(() => toast.value = null, 3000)
}

const initials = ref('')
initials.value = (auth.user?.display_name || auth.user?.email || 'C')
  .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
</script>

<template>
  <div class="profile-page">
    <div class="page-header">
      <span class="page-label">CREATOR PROFILE</span>
      <h2>My Profile</h2>
    </div>

    <!-- Toast -->
    <div v-if="toast" :class="['toast', toast.type]">{{ toast.message }}</div>

    <div class="profile-layout">
      <!-- Left: Profile Card -->
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-large">{{ initials }}</div>
          <h3>{{ form.display_name || 'Creator' }}</h3>
          <p class="email">{{ auth.user?.email }}</p>
          <span class="role-badge">Creator</span>
          <p class="joined">Member since {{ new Date(auth.user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}</p>
        </div>
      </div>

      <!-- Right: Edit Form -->
      <div class="profile-form-card">
        <h3>Profile Information</h3>
        <p class="form-subtitle">This is how you'll appear to the BetterFeel community</p>

        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input v-model="form.display_name" type="text" class="form-input" placeholder="Your creator name" />
          </div>

          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea v-model="form.bio" class="form-input form-textarea" rows="4" placeholder="Tell the community about yourself and your expertise..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Website</label>
            <input v-model="form.website" type="url" class="form-input" placeholder="https://yourwebsite.com" />
          </div>

          <div class="form-divider"></div>
          <h4 class="social-heading">Social Links</h4>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">YouTube</label>
              <input v-model="form.social_youtube" type="url" class="form-input" placeholder="YouTube channel URL" />
            </div>
            <div class="form-group">
              <label class="form-label">Instagram</label>
              <input v-model="form.social_instagram" type="text" class="form-input" placeholder="@username" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Twitter / X</label>
            <input v-model="form.social_twitter" type="text" class="form-input" placeholder="@handle" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page { padding: 32px; max-width: 1100px; }
.page-header { margin-bottom: 28px; }
.page-label { font-size: 12px; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 1.5px; }
.page-header h2 { font-size: 28px; font-weight: 700; margin-top: 4px; color: var(--text-primary); }

.profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }

.profile-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
}
.avatar-section { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.avatar-large {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--primary); color: white;
  font-size: 28px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.avatar-section h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0; }
.email { font-size: 14px; color: var(--text-secondary); margin: 0; }
.role-badge {
  display: inline-block;
  padding: 4px 14px;
  background: var(--primary-bg);
  color: var(--primary);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}
.joined { font-size: 13px; color: var(--text-secondary); margin-top: 12px; }

.profile-form-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
}
.profile-form-card h3 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
.form-subtitle { font-size: 14px; color: var(--text-secondary); margin: 0 0 24px; }

.form-divider { height: 1px; background: var(--border); margin: 24px 0 16px; }
.social-heading { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-textarea { resize: vertical; min-height: 100px; font-family: inherit; }

.form-actions { margin-top: 24px; display: flex; justify-content: flex-end; }

.toast {
  position: fixed; top: 24px; right: 24px; z-index: 100;
  padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;
  animation: slideIn 0.3s ease;
}
.toast.success { background: #dcfce7; color: #16a34a; }
.toast.error { background: #fee2e2; color: #dc2626; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: none; opacity: 1; } }

@media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }
</style>
