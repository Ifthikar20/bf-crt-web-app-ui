<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store'
import { authApi } from '../api'
import PhoneSimulator from '../components/PhoneSimulator.vue'

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

    <div class="profile-main-layout">
      <!-- Left: Form Area -->
      <div class="profile-form-area">
        <div class="profile-layout">
          <!-- Profile Card -->
          <div class="profile-card">
            <div class="avatar-section">
              <div class="avatar-large">{{ initials }}</div>
              <h3>{{ form.display_name || 'Creator' }}</h3>
              <p class="email">{{ auth.user?.email }}</p>
              <span class="role-badge">Creator</span>
              <p class="joined">Member since {{ new Date(auth.user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}</p>
            </div>
          </div>

          <!-- Edit Form -->
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

      <!-- Right: Phone Simulator -->
      <div class="simulator-panel">
        <PhoneSimulator label="iPhone 17 Pro">
          <div class="mobile-profile">
            <!-- Mobile Header -->
            <div class="mob-header">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              <span class="mob-header-title">Creator Profile</span>
              <div style="width:20px"></div>
            </div>

            <!-- Cover Gradient -->
            <div class="mob-cover">
              <div class="mob-cover-overlay"></div>
            </div>

            <!-- Avatar -->
            <div class="mob-avatar-row">
              <div class="mob-avatar">{{ initials }}</div>
            </div>

            <!-- Name & Bio -->
            <div class="mob-info">
              <h3 class="mob-name">{{ form.display_name || 'Creator Name' }}</h3>
              <p class="mob-role">Wellness Creator</p>
              <p class="mob-bio">{{ form.bio || 'No bio yet. Tell your audience about yourself...' }}</p>
            </div>

            <!-- Stats -->
            <div class="mob-stats">
              <div class="mob-stat">
                <span class="mob-stat-num">12.4K</span>
                <span class="mob-stat-label">Followers</span>
              </div>
              <div class="mob-stat-divider"></div>
              <div class="mob-stat">
                <span class="mob-stat-num">48</span>
                <span class="mob-stat-label">Content</span>
              </div>
              <div class="mob-stat-divider"></div>
              <div class="mob-stat">
                <span class="mob-stat-num">4.9</span>
                <span class="mob-stat-label">Rating</span>
              </div>
            </div>

            <!-- Follow Button -->
            <div class="mob-action-row">
              <button class="mob-follow-btn">Follow</button>
              <button class="mob-share-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </button>
            </div>

            <!-- Social Links -->
            <div v-if="form.social_instagram || form.social_youtube || form.social_twitter" class="mob-social">
              <div v-if="form.social_instagram" class="mob-social-chip">
                <span>📸</span> {{ form.social_instagram }}
              </div>
              <div v-if="form.social_youtube" class="mob-social-chip">
                <span>▶️</span> YouTube
              </div>
              <div v-if="form.social_twitter" class="mob-social-chip">
                <span>𝕏</span> {{ form.social_twitter }}
              </div>
            </div>

            <!-- Content Tabs -->
            <div class="mob-tabs">
              <div class="mob-tab mob-tab-active">Content</div>
              <div class="mob-tab">Series</div>
              <div class="mob-tab">About</div>
            </div>

            <!-- Sample Content Cards -->
            <div class="mob-content-list">
              <div class="mob-content-card">
                <div class="mob-card-thumb" style="background: linear-gradient(135deg, #667eea, #764ba2);"></div>
                <div class="mob-card-info">
                  <div class="mob-card-title">Morning Meditation</div>
                  <div class="mob-card-meta">5 min · Video</div>
                </div>
              </div>
              <div class="mob-content-card">
                <div class="mob-card-thumb" style="background: linear-gradient(135deg, #f093fb, #f5576c);"></div>
                <div class="mob-card-info">
                  <div class="mob-card-title">Stress Relief Guide</div>
                  <div class="mob-card-meta">12 min · Audio</div>
                </div>
              </div>
              <div class="mob-content-card">
                <div class="mob-card-thumb" style="background: linear-gradient(135deg, #4facfe, #00f2fe);"></div>
                <div class="mob-card-info">
                  <div class="mob-card-title">Sleep Better Tonight</div>
                  <div class="mob-card-meta">8 min · Article</div>
                </div>
              </div>
            </div>
          </div>
        </PhoneSimulator>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page { padding: 32px; max-width: 1400px; }
.page-header { margin-bottom: 28px; }
.page-label { font-size: 12px; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 1.5px; }
.page-header h2 { font-size: 28px; font-weight: 700; margin-top: 4px; color: var(--text-primary); }

.profile-main-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}
.profile-form-area { min-width: 0; }

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
  display: inline-block; padding: 4px 14px;
  background: var(--primary-bg); color: var(--primary);
  border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 4px;
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

/* Simulator Panel */
.simulator-panel {
  position: sticky;
  top: 24px;
  display: flex;
  justify-content: center;
}

/* ═══════ Mobile Preview Styles ═══════ */
.mobile-profile {
  font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  min-height: 100%;
}

.mob-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}
.mob-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.mob-cover {
  height: 80px;
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
  position: relative;
}
.mob-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(0,0,0,0.15));
}

.mob-avatar-row {
  display: flex;
  justify-content: center;
  margin-top: -32px;
  position: relative;
  z-index: 2;
}
.mob-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.mob-info {
  text-align: center;
  padding: 10px 16px 0;
}
.mob-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}
.mob-role {
  font-size: 12px;
  color: #6366f1;
  font-weight: 500;
  margin: 2px 0 0;
}
.mob-bio {
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
  margin: 8px 0 0;
}

.mob-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 14px 16px;
  margin: 12px 14px 0;
  background: #f8fafc;
  border-radius: 12px;
}
.mob-stat {
  flex: 1;
  text-align: center;
}
.mob-stat-num {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
}
.mob-stat-label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.mob-stat-divider {
  width: 1px;
  height: 28px;
  background: #e2e8f0;
}

.mob-action-row {
  display: flex;
  gap: 8px;
  padding: 12px 14px 0;
}
.mob-follow-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: default;
}
.mob-share-btn {
  width: 40px;
  height: 40px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.mob-social {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 14px 0;
}
.mob-social-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 10px;
  color: #475569;
  font-weight: 500;
}

.mob-tabs {
  display: flex;
  border-bottom: 1.5px solid #e2e8f0;
  margin-top: 14px;
}
.mob-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  cursor: default;
}
.mob-tab-active {
  color: #6366f1;
  font-weight: 600;
  border-bottom: 2px solid #6366f1;
}

.mob-content-list {
  padding: 10px 14px 20px;
}
.mob-content-card {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}
.mob-content-card:last-child { border-bottom: none; }
.mob-card-thumb {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  flex-shrink: 0;
}
.mob-card-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}
.mob-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mob-card-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

@media (max-width: 1100px) {
  .profile-main-layout { grid-template-columns: 1fr; }
  .simulator-panel { position: static; margin-top: 20px; }
}
@media (max-width: 768px) {
  .profile-layout { grid-template-columns: 1fr; }
}
</style>
