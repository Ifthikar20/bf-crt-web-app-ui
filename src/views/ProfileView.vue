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

      <!-- Right: Phone Simulator — matches actual Flutter app -->
      <div class="simulator-panel">
        <PhoneSimulator label="iPhone 17 Pro">
          <div class="bf-app">
            <!-- Gradient Header — matches Flutter profile_page.dart headerGradient -->
            <div class="bf-header">
              <div class="bf-header-top">
                <span class="bf-header-title">Profile</span>
              </div>

              <!-- Avatar Row — horizontal layout, 72px rounded-square -->
              <div class="bf-avatar-row">
                <div class="bf-avatar-wrap">
                  <div class="bf-avatar">{{ initials }}</div>
                </div>
                <div class="bf-user-info">
                  <div class="bf-user-name">{{ form.display_name || 'Creator' }}</div>
                  <div class="bf-user-email">{{ auth.user?.email || 'creator@betterbliss.com' }}</div>
                  <div class="bf-signout-pill">
                    <span class="bf-signout-icon">⎋</span> Sign Out
                  </div>
                </div>
              </div>

              <!-- Goals Stats Row — surface card -->
              <div class="bf-goals-row">
                <div class="bf-goal-item">
                  <div class="bf-goal-icon">🧘</div>
                  <div class="bf-goal-progress">
                    <div class="bf-goal-bar"><div class="bf-goal-fill" style="width:72%"></div></div>
                    <span class="bf-goal-label">Meditation</span>
                  </div>
                </div>
                <div class="bf-goal-divider"></div>
                <div class="bf-goal-item">
                  <div class="bf-goal-icon">💪</div>
                  <div class="bf-goal-progress">
                    <div class="bf-goal-bar"><div class="bf-goal-fill" style="width:45%; background:#7C3AED"></div></div>
                    <span class="bf-goal-label">Fitness</span>
                  </div>
                </div>
                <div class="bf-goal-divider"></div>
                <div class="bf-goal-item">
                  <div class="bf-goal-icon">📖</div>
                  <div class="bf-goal-progress">
                    <div class="bf-goal-bar"><div class="bf-goal-fill" style="width:90%; background:#22C55E"></div></div>
                    <span class="bf-goal-label">Reading</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Theme Toggle Card -->
            <div class="bf-section">
              <div class="bf-theme-card">
                <div class="bf-theme-icon">🌙</div>
                <div class="bf-theme-info">
                  <div class="bf-theme-title">Dark Theme</div>
                  <div class="bf-theme-sub">Tap to switch to Light mode</div>
                </div>
                <span class="bf-swap">⇆</span>
              </div>
            </div>

            <!-- Membership Card — dark gradient -->
            <div class="bf-section">
              <div class="bf-section-title">Membership</div>
              <div class="bf-membership-card">
                <div class="bf-member-top">
                  <div class="bf-member-icon">⭐</div>
                  <div>
                    <div class="bf-member-plan">Free Plan</div>
                    <div class="bf-member-desc">Limited access to content</div>
                  </div>
                </div>
                <div class="bf-member-divider"></div>
                <div class="bf-member-bottom">
                  <span class="bf-member-cta-text">Upgrade to unlock all content</span>
                  <div class="bf-member-btn">Upgrade</div>
                </div>
              </div>
            </div>

            <!-- Settings List -->
            <div class="bf-section">
              <div class="bf-section-title">Settings</div>
              <div class="bf-settings-card">
                <div class="bf-setting-item">
                  <span class="bf-setting-icon">👤</span>
                  <span class="bf-setting-label">Account Settings</span>
                  <span class="bf-chevron">›</span>
                </div>
                <div class="bf-setting-item">
                  <span class="bf-setting-icon">🔐</span>
                  <span class="bf-setting-label">Change Password</span>
                  <span class="bf-chevron">›</span>
                </div>
                <div class="bf-setting-item">
                  <span class="bf-setting-icon">🔔</span>
                  <span class="bf-setting-label">Notifications</span>
                  <span class="bf-chevron">›</span>
                </div>
                <div class="bf-setting-item bf-setting-last">
                  <span class="bf-setting-icon">❓</span>
                  <span class="bf-setting-label">Help & Support</span>
                  <span class="bf-chevron">›</span>
                </div>
              </div>
            </div>

            <div style="height:70px"></div>

            <!-- Bottom Nav — glassmorphism, 5 tabs -->
            <div class="bf-bottom-nav">
              <div class="bf-nav-item">
                <span class="bf-nav-icon">🏠</span>
                <span class="bf-nav-label">Home</span>
              </div>
              <div class="bf-nav-item">
                <span class="bf-nav-icon">🔥</span>
                <span class="bf-nav-label">Calories</span>
              </div>
              <div class="bf-nav-item">
                <span class="bf-nav-icon">🧭</span>
                <span class="bf-nav-label">Explore</span>
              </div>
              <div class="bf-nav-item">
                <span class="bf-nav-icon">📋</span>
                <span class="bf-nav-label">Classes</span>
              </div>
              <div class="bf-nav-item bf-nav-active">
                <div class="bf-nav-avatar">{{ initials.charAt(0) }}</div>
                <span class="bf-nav-label bf-nav-label-active">Profile</span>
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
  background: white; border: 1px solid var(--border); border-radius: 12px; padding: 32px 24px; text-align: center;
}
.avatar-section { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.avatar-large {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--primary); color: white; font-size: 28px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
}
.avatar-section h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0; }
.email { font-size: 14px; color: var(--text-secondary); margin: 0; }
.role-badge { display: inline-block; padding: 4px 14px; background: var(--primary-bg); color: var(--primary); border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 4px; }
.joined { font-size: 13px; color: var(--text-secondary); margin-top: 12px; }

.profile-form-card { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 32px; }
.profile-form-card h3 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
.form-subtitle { font-size: 14px; color: var(--text-secondary); margin: 0 0 24px; }
.form-divider { height: 1px; background: var(--border); margin: 24px 0 16px; }
.social-heading { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-textarea { resize: vertical; min-height: 100px; font-family: inherit; }
.form-actions { margin-top: 24px; display: flex; justify-content: flex-end; }

.toast { position: fixed; top: 24px; right: 24px; z-index: 100; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; animation: slideIn 0.3s ease; }
.toast.success { background: #dcfce7; color: #16a34a; }
.toast.error { background: #fee2e2; color: #dc2626; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: none; opacity: 1; } }

.simulator-panel { position: sticky; top: 24px; display: flex; justify-content: center; }

/* ═══════════════════════════════════════════════
   BetterFeel Mobile App — Accurate Flutter Replica
   Colors from app_theme.dart ThemeColors (dark mode)
   ═══════════════════════════════════════════════ */
.bf-app {
  font-family: 'Inter', -apple-system, 'SF Pro Display', system-ui, sans-serif;
  background: #0A0A0A;
  min-height: 100%;
  position: relative;
}

/* Header — gradient from primaryColor (0A84FF) at 30% to bg */
.bf-header {
  background: linear-gradient(to bottom, rgba(10, 132, 255, 0.3), #0A0A0A);
  padding: 16px 16px 0;
}
.bf-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.bf-header-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

/* Avatar Row — horizontal, 72px rounded-square */
.bf-avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.bf-avatar-wrap {
  padding: 3px;
  border-radius: 16px;
  border: 2px solid #fff;
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}
.bf-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), #666);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}
.bf-user-info { flex: 1; min-width: 0; }
.bf-user-name {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bf-user-email {
  font-size: 11px;
  color: rgba(156, 163, 175, 0.8);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bf-signout-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 6px;
  padding: 3px 10px;
  background: rgba(255, 69, 58, 0.15);
  border: 1px solid rgba(255, 69, 58, 0.3);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  color: #FF453A;
}
.bf-signout-icon { font-size: 10px; }

/* Goals Stats Row */
.bf-goals-row {
  display: flex;
  align-items: center;
  background: #1C1C1E;
  border-radius: 16px;
  border: 1px solid #2C2C2E;
  padding: 14px 10px;
  margin-bottom: 16px;
}
.bf-goal-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.bf-goal-icon { font-size: 18px; }
.bf-goal-progress { width: 100%; padding: 0 6px; }
.bf-goal-bar {
  width: 100%;
  height: 4px;
  background: #2C2C2E;
  border-radius: 2px;
  overflow: hidden;
}
.bf-goal-fill {
  height: 100%;
  background: #0A84FF;
  border-radius: 2px;
  transition: width 0.6s ease;
}
.bf-goal-label {
  font-size: 9px;
  color: #9CA3AF;
  text-align: center;
  display: block;
  margin-top: 2px;
}
.bf-goal-divider {
  width: 1px;
  height: 36px;
  background: rgba(156, 163, 175, 0.2);
  flex-shrink: 0;
}

/* Sections */
.bf-section { padding: 0 16px; margin-bottom: 16px; }
.bf-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #0A84FF;
  margin-bottom: 10px;
  letter-spacing: 0.02em;
}

/* Theme Toggle Card */
.bf-theme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(75,75,75,0.3), rgba(45,45,45,0.2));
  border-radius: 16px;
  border: 1px solid rgba(156, 163, 175, 0.2);
}
.bf-theme-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(156, 163, 175, 0.15);
  border-radius: 10px;
  font-size: 18px;
}
.bf-theme-info { flex: 1; }
.bf-theme-title { font-size: 13px; font-weight: 600; color: #fff; }
.bf-theme-sub { font-size: 10px; color: rgba(156, 163, 175, 0.7); margin-top: 1px; }
.bf-swap { font-size: 18px; color: #9CA3AF; }

/* Membership Card */
.bf-membership-card {
  background: linear-gradient(135deg, #404040, #2D2D2D, #1A1A1A);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}
.bf-member-top { display: flex; align-items: center; gap: 10px; }
.bf-member-icon {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  font-size: 18px;
}
.bf-member-plan { font-size: 14px; font-weight: 700; color: #fff; }
.bf-member-desc { font-size: 10px; color: rgba(255,255,255,0.8); }
.bf-member-divider { height: 1px; background: rgba(255,255,255,0.3); margin: 12px 0; }
.bf-member-bottom { display: flex; justify-content: space-between; align-items: center; }
.bf-member-cta-text { font-size: 10px; color: #fff; flex: 1; line-height: 1.4; }
.bf-member-btn {
  padding: 6px 14px;
  background: #fff;
  color: #000;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

/* Settings List */
.bf-settings-card {
  background: #1C1C1E;
  border-radius: 16px;
  border: 1px solid #2C2C2E;
  overflow: hidden;
}
.bf-setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px;
  border-bottom: 1px solid #2C2C2E;
}
.bf-setting-last { border-bottom: none; }
.bf-setting-icon { font-size: 16px; width: 20px; text-align: center; }
.bf-setting-label { flex: 1; font-size: 13px; color: #fff; font-weight: 400; }
.bf-chevron { font-size: 18px; color: #9CA3AF; }

/* Bottom Nav — glassmorphism, blur sigma 24 */
.bf-bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 4px 18px;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 0.5px solid rgba(255, 255, 255, 0.06);
}
.bf-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 44px;
}
.bf-nav-icon { font-size: 18px; filter: grayscale(0.7) opacity(0.54); }
.bf-nav-active .bf-nav-icon { filter: none; }
.bf-nav-label {
  font-size: 8px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.54);
  font-family: 'Inter', sans-serif;
}
.bf-nav-label-active {
  color: #fff;
  font-weight: 600;
}
.bf-nav-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  color: #000;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

@media (max-width: 1100px) {
  .profile-main-layout { grid-template-columns: 1fr; }
  .simulator-panel { position: static; margin-top: 20px; }
}
@media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }
</style>
