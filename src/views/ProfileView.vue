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

      <!-- Right: Phone Simulator — Expert/Speaker Profile (Glo-style) -->
      <div class="simulator-panel">
        <PhoneSimulator label="iPhone 17 Pro">
          <div class="bf-app">
            <!-- Back + Share buttons -->
            <div class="bf-topbar">
              <div class="bf-back-btn">‹</div>
              <div class="bf-back-btn">⇪</div>
            </div>

            <!-- Name + Specialties + Class count -->
            <div class="bf-expert-header">
              <div class="bf-expert-name">{{ form.display_name || 'Creator Name' }}</div>
              <div class="bf-expert-specialties">Wellness, Meditation, Mindfulness</div>
              <div class="bf-expert-classes">12 classes</div>
              <div class="bf-follow-btn">Follow</div>
            </div>

            <!-- Big Portrait Photo (3:4 ratio) -->
            <div class="bf-portrait">
              <div class="bf-portrait-placeholder">
                <span class="bf-portrait-initials">{{ initials }}</span>
              </div>
            </div>

            <!-- About / Bio -->
            <div class="bf-about-section">
              <div class="bf-section-heading">About</div>
              <div class="bf-bio-text">{{ form.bio || 'Wellness expert dedicated to helping people find balance through meditation, breathwork, and mindful movement.' }}</div>
            </div>

            <!-- Social Links — colored pills -->
            <div class="bf-social-links">
              <div v-if="form.social_instagram" class="bf-link-pill bf-link-instagram">
                <span class="bf-link-icon">📷</span> Instagram
              </div>
              <div v-if="form.social_youtube" class="bf-link-pill bf-link-youtube">
                <span class="bf-link-icon">▶</span> YouTube
              </div>
              <div v-if="form.website" class="bf-link-pill bf-link-website">
                <span class="bf-link-icon">🔗</span> Website
              </div>
              <div v-if="!form.social_instagram && !form.social_youtube && !form.website" class="bf-link-pill bf-link-website">
                <span class="bf-link-icon">🔗</span> Website
              </div>
            </div>

            <!-- Classes by this expert — horizontal scroll -->
            <div class="bf-classes-section">
              <div class="bf-section-heading">Classes by {{ form.display_name?.split(' ')[0] || 'Creator' }}</div>
              <div class="bf-classes-scroll">
                <div class="bf-class-card">
                  <div class="bf-class-thumb bf-grad-1">
                    <span class="bf-play-icon">▶</span>
                    <span class="bf-duration">12:30</span>
                  </div>
                  <div class="bf-class-title">Morning Meditation</div>
                  <div class="bf-class-cat">Mindfulness</div>
                </div>
                <div class="bf-class-card">
                  <div class="bf-class-thumb bf-grad-2">
                    <span class="bf-play-icon">▶</span>
                    <span class="bf-duration">8:15</span>
                  </div>
                  <div class="bf-class-title">Breathwork Basics</div>
                  <div class="bf-class-cat">Breathing</div>
                </div>
                <div class="bf-class-card">
                  <div class="bf-class-thumb bf-grad-3">
                    <span class="bf-play-icon">▶</span>
                    <span class="bf-duration">22:00</span>
                  </div>
                  <div class="bf-class-title">Deep Sleep Guide</div>
                  <div class="bf-class-cat">Sleep</div>
                </div>
              </div>
            </div>

            <!-- Series rows -->
            <div class="bf-series-section">
              <div class="bf-section-heading">Series</div>
              <div class="bf-series-row">
                <div class="bf-series-thumb bf-grad-4"></div>
                <div class="bf-series-info">
                  <div class="bf-series-title">Daily Calm</div>
                  <div class="bf-series-meta">8 episodes</div>
                </div>
                <span class="bf-chevron">›</span>
              </div>
              <div class="bf-series-row">
                <div class="bf-series-thumb bf-grad-5"></div>
                <div class="bf-series-info">
                  <div class="bf-series-title">Stress Relief</div>
                  <div class="bf-series-meta">5 episodes</div>
                </div>
                <span class="bf-chevron">›</span>
              </div>
            </div>

            <div style="height:24px"></div>
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
   Expert/Speaker Profile — Glo-style (speaker_page.dart)
   Dark mode #0A0A0A bg, Inter font, iOS-native feel
   ═══════════════════════════════════════════════ */
.bf-app {
  font-family: 'Inter', -apple-system, 'SF Pro Display', system-ui, sans-serif;
  background: #0A0A0A;
  min-height: 100%;
}

/* Top bar — back + share circles */
.bf-topbar {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px 0;
}
.bf-back-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #1C1C1E;
  border: 1px solid #2C2C2E;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 300;
}

/* Expert Header — name is BIG */
.bf-expert-header {
  padding: 18px 18px 0;
}
.bf-expert-name {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  margin-bottom: 8px;
}
.bf-expert-specialties {
  font-size: 12px;
  color: #9CA3AF;
  line-height: 1.4;
  margin-bottom: 4px;
}
.bf-expert-classes {
  font-size: 11px;
  color: #9CA3AF;
  margin-bottom: 14px;
}
.bf-follow-btn {
  display: inline-block;
  padding: 10px 24px;
  background: #fff;
  color: #000;
  font-size: 13px;
  font-weight: 700;
  border-radius: 22px;
  font-family: 'Inter', sans-serif;
}

/* Portrait Photo — 3:4 ratio, edge-to-edge */
.bf-portrait {
  margin-top: 18px;
  aspect-ratio: 3 / 4;
  width: 100%;
  overflow: hidden;
}
.bf-portrait-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #1C1C1E, #2C2C2E, #1A1A2E);
  display: flex;
  align-items: center;
  justify-content: center;
}
.bf-portrait-initials {
  font-size: 56px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.15);
  font-family: 'Inter', sans-serif;
}

/* About / Bio */
.bf-about-section {
  padding: 20px 18px 0;
}
.bf-section-heading {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.bf-bio-text {
  font-size: 12px;
  color: #9CA3AF;
  line-height: 1.6;
}

/* Social link pills */
.bf-social-links {
  padding: 14px 18px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.bf-link-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
}
.bf-link-icon { font-size: 12px; }
.bf-link-instagram { background: rgba(228, 64, 95, 0.2); border: 1px solid rgba(228, 64, 95, 0.3); color: #E4405F; }
.bf-link-youtube { background: rgba(255, 0, 0, 0.15); border: 1px solid rgba(255, 0, 0, 0.25); color: #FF4444; }
.bf-link-website { background: rgba(10, 132, 255, 0.15); border: 1px solid rgba(10, 132, 255, 0.25); color: #0A84FF; }

/* Classes — horizontal scroll cards */
.bf-classes-section {
  padding: 20px 0 0 18px;
}
.bf-classes-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  padding-right: 18px;
}
.bf-classes-scroll::-webkit-scrollbar { display: none; }
.bf-class-card {
  flex-shrink: 0;
  width: 140px;
}
.bf-class-thumb {
  width: 140px;
  height: 100px;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bf-grad-1 { background: linear-gradient(135deg, #0A84FF, #7C3AED); }
.bf-grad-2 { background: linear-gradient(135deg, #22C55E, #0A84FF); }
.bf-grad-3 { background: linear-gradient(135deg, #7C3AED, #EC4899); }
.bf-grad-4 { background: linear-gradient(135deg, #F59E0B, #EF4444); }
.bf-grad-5 { background: linear-gradient(135deg, #06B6D4, #3B82F6); }
.bf-play-icon {
  font-size: 20px;
  color: rgba(255,255,255,0.7);
}
.bf-duration {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 2px 6px;
  background: rgba(0,0,0,0.6);
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  color: #fff;
}
.bf-class-title {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  margin-top: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bf-class-cat {
  font-size: 9px;
  color: #9CA3AF;
}

/* Series rows */
.bf-series-section {
  padding: 20px 18px 0;
}
.bf-series-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #1A1A1A;
  border-radius: 14px;
  border: 1px solid #2C2C2E;
  margin-bottom: 8px;
}
.bf-series-thumb {
  width: 50px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}
.bf-series-info { flex: 1; min-width: 0; }
.bf-series-title {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.bf-series-meta {
  font-size: 10px;
  color: #9CA3AF;
  margin-top: 1px;
}
.bf-chevron {
  font-size: 18px;
  color: #9CA3AF;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .profile-main-layout { grid-template-columns: 1fr; }
  .simulator-panel { position: static; margin-top: 20px; }
}
@media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }
</style>
