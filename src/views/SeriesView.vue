<script setup>
import { ref, onMounted } from 'vue'
import { seriesApi } from '../api'
import { useAuthStore } from '../store'
import PhoneSimulator from '../components/PhoneSimulator.vue'

const auth = useAuthStore()
const seriesList = ref([])
const showForm = ref(false)
const showDetail = ref(null)
const form = ref({ title: '', description: '' })
const loading = ref(true)

const initials = ref('')
initials.value = (auth.user?.display_name || auth.user?.email || 'C')
  .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

onMounted(fetchSeries)

async function fetchSeries() {
  loading.value = true
  try {
    const { data } = await seriesApi.list()
    seriesList.value = data || []
  } catch (err) { console.error('Failed:', err) }
  finally { loading.value = false }
}

async function createSeries() {
  try { await seriesApi.create(form.value); showForm.value = false; fetchSeries() }
  catch (err) { console.error('Create failed:', err) }
}

async function viewDetail(id) {
  try { const { data } = await seriesApi.get(id); showDetail.value = data }
  catch (err) { console.error('Detail failed:', err) }
}

async function togglePublish(series) {
  try {
    if (series.is_published) await seriesApi.unpublish(series.id)
    else await seriesApi.publish(series.id)
    fetchSeries()
    if (showDetail.value?.id === series.id) viewDetail(series.id)
  } catch (err) { console.error('Toggle failed:', err) }
}

const categoryGradients = [
  'linear-gradient(135deg, #0A84FF, #7C3AED)',
  'linear-gradient(135deg, #7C3AED, #EC4899)',
  'linear-gradient(135deg, #22C55E, #0A84FF)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #06B6D4, #3B82F6)',
  'linear-gradient(135deg, #8B5CF6, #D946EF)',
]
</script>

<template>
  <div class="series-page">
    <div class="page-header">
      <div>
        <div class="subtitle-label">Collections</div>
        <h2>Series</h2>
      </div>
      <button class="btn btn-primary" @click="form = { title: '', description: '' }; showForm = true">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Series
      </button>
    </div>

    <div class="series-main-layout">
      <!-- Left: Series List -->
      <div class="series-list-area">
        <div class="card-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
          <div v-if="loading" class="empty-state" style="grid-column:1/-1; padding:40px"><div class="spinner" style="margin:0 auto"></div></div>
          <div v-else-if="seriesList.length === 0" class="empty-state" style="grid-column:1/-1;">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-muted)" fill="none" stroke-width="1.5" style="margin:0 auto 16px;display:block;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <h3>No series yet</h3>
            <p>Create a series to group related content together.</p>
          </div>
          <div v-for="series in seriesList" :key="series.id" class="card" style="cursor:pointer;" @click="viewDetail(series.id)">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
              <h4 style="font-size:16px; font-weight:600;">{{ series.title }}</h4>
              <span class="badge" :class="series.is_published ? 'badge-published' : 'badge-draft'">{{ series.is_published ? 'Published' : 'Draft' }}</span>
            </div>
            <p v-if="series.description" style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:16px;">{{ series.description?.substring(0, 100) }}{{ series.description?.length > 100 ? '...' : '' }}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid var(--border-light);">
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:28px; height:28px; border-radius:50%; background:var(--purple-bg); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--purple);">{{ series.episodes?.length || 0 }}</div>
                <span style="font-size:12px; color:var(--text-muted);">episodes</span>
              </div>
              <button class="btn btn-sm" :class="series.is_published ? 'btn-danger' : 'btn-success'" @click.stop="togglePublish(series)">
                {{ series.is_published ? 'Unpublish' : 'Publish' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Phone Simulator — Flutter Explore page style -->
      <div class="simulator-panel">
        <PhoneSimulator label="iPhone 17 Pro">
          <div class="bf-app">
            <!-- Explore Header -->
            <div class="bf-explore-header">
              <div class="bf-explore-top">
                <span class="bf-explore-title">Explore</span>
                <div class="bf-search-icon">🔍</div>
              </div>

              <!-- Category Chips (horizontal scroll) -->
              <div class="bf-chips-row">
                <div class="bf-chip bf-chip-active">For You</div>
                <div class="bf-chip">Meditation</div>
                <div class="bf-chip">Fitness</div>
                <div class="bf-chip">Sleep</div>
              </div>
            </div>

            <!-- Featured Series -->
            <div class="bf-featured-section">
              <div class="bf-featured-header">
                <span class="bf-featured-label">Featured Series</span>
                <span class="bf-see-all">See All</span>
              </div>

              <div class="bf-featured-card" :style="{ background: categoryGradients[0] }">
                <div class="bf-featured-overlay">
                  <div class="bf-featured-badge">SERIES</div>
                  <div class="bf-featured-name">{{ seriesList[0]?.title || 'Your First Series' }}</div>
                  <div class="bf-featured-meta">{{ seriesList[0]?.episodes?.length || 0 }} episodes</div>
                </div>
              </div>
            </div>

            <!-- Your Series in "Programs" style -->
            <div class="bf-programs-section">
              <div class="bf-featured-header">
                <span class="bf-featured-label">Your Programs</span>
                <span class="bf-series-count">{{ seriesList.length }}</span>
              </div>

              <!-- Empty State -->
              <div v-if="seriesList.length === 0" class="bf-empty">
                <div class="bf-empty-icon">📚</div>
                <div class="bf-empty-text">No series yet</div>
              </div>

              <!-- Series Cards — matches Flutter card style -->
              <div v-for="(series, idx) in seriesList.slice(0, 4)" :key="series.id" class="bf-program-card">
                <div class="bf-program-thumb" :style="{ background: categoryGradients[idx % categoryGradients.length] }">
                  <div class="bf-program-count">{{ series.episodes?.length || 0 }}</div>
                </div>
                <div class="bf-program-info">
                  <div class="bf-program-title">{{ series.title || 'Untitled' }}</div>
                  <div class="bf-program-meta">
                    <span :class="series.is_published ? 'bf-pub' : 'bf-draft'">
                      {{ series.is_published ? '● Live' : '○ Draft' }}
                    </span>
                    · {{ series.episodes?.length || 0 }} episodes
                  </div>
                </div>
                <span class="bf-arrow">›</span>
              </div>
            </div>

            <!-- Categories Section -->
            <div class="bf-programs-section">
              <div class="bf-featured-header">
                <span class="bf-featured-label">Browse Categories</span>
              </div>
              <div class="bf-category-grid">
                <div class="bf-cat-item" style="background: linear-gradient(135deg, #0A84FF, #7C3AED)">
                  <span class="bf-cat-emoji">🧘</span>
                  <span class="bf-cat-name">Mindfulness</span>
                </div>
                <div class="bf-cat-item" style="background: linear-gradient(135deg, #22C55E, #0A84FF)">
                  <span class="bf-cat-emoji">💪</span>
                  <span class="bf-cat-name">Fitness</span>
                </div>
                <div class="bf-cat-item" style="background: linear-gradient(135deg, #7C3AED, #EC4899)">
                  <span class="bf-cat-emoji">🥗</span>
                  <span class="bf-cat-name">Nutrition</span>
                </div>
                <div class="bf-cat-item" style="background: linear-gradient(135deg, #F59E0B, #EF4444)">
                  <span class="bf-cat-emoji">😴</span>
                  <span class="bf-cat-name">Sleep</span>
                </div>
              </div>
            </div>

            <div style="height:70px"></div>

            <!-- Bottom Nav -->
            <div class="bf-bottom-nav">
              <div class="bf-nav-item">
                <span class="bf-nav-icon">🏠</span>
                <span class="bf-nav-label">Home</span>
              </div>
              <div class="bf-nav-item">
                <span class="bf-nav-icon">🔥</span>
                <span class="bf-nav-label">Calories</span>
              </div>
              <div class="bf-nav-item bf-nav-active">
                <span class="bf-nav-icon">🧭</span>
                <span class="bf-nav-label bf-nav-label-active">Explore</span>
              </div>
              <div class="bf-nav-item">
                <span class="bf-nav-icon">📋</span>
                <span class="bf-nav-label">Classes</span>
              </div>
              <div class="bf-nav-item">
                <div class="bf-nav-avatar-inactive">{{ initials.charAt(0) }}</div>
                <span class="bf-nav-label">Profile</span>
              </div>
            </div>
          </div>
        </PhoneSimulator>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>New Series</h3>
          <button class="modal-close" @click="showForm = false">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">Title</label>
          <input v-model="form.title" class="form-input" placeholder="Series title" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-textarea" placeholder="Describe this series"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showForm = false">Cancel</button>
          <button class="btn btn-primary" @click="createSeries">Create Series</button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = null">
      <div class="modal" style="max-width:600px;">
        <div class="modal-header">
          <h3>{{ showDetail.title }}</h3>
          <button class="modal-close" @click="showDetail = null">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p style="font-size:14px; color:var(--text-secondary); line-height:1.5; margin-bottom:20px;">{{ showDetail.description || 'No description' }}</p>
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:20px;">
          <span class="badge" :class="showDetail.is_published ? 'badge-published' : 'badge-draft'">{{ showDetail.is_published ? 'Published' : 'Draft' }}</span>
          <span style="font-size:13px; color:var(--text-muted);">{{ showDetail.episodes?.length || 0 }} episodes</span>
        </div>
        <div v-if="showDetail.episodes?.length > 0">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted); margin-bottom:12px;">Episodes</div>
          <div v-for="(ep, i) in showDetail.episodes" :key="ep.id" class="card" style="padding:14px; margin-bottom:8px; display:flex; align-items:center; gap:14px;">
            <div style="width:30px; height:30px; border-radius:50%; background:var(--purple-bg); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--purple); flex-shrink:0;">{{ i + 1 }}</div>
            <div style="flex:1;">
              <div style="font-size:14px; font-weight:600;">{{ ep.title }}</div>
              <div style="font-size:12px; color:var(--text-muted);">{{ ep.content_type || 'Content' }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state" style="padding:20px 0;">
          <p>No episodes in this series yet.</p>
        </div>
        <div class="modal-actions" style="margin-top:20px;">
          <button class="btn" :class="showDetail.is_published ? 'btn-danger' : 'btn-success'" @click="togglePublish(showDetail)">
            {{ showDetail.is_published ? 'Unpublish' : 'Publish' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.series-page { padding: 32px; max-width: 1400px; }
.series-main-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}
.series-list-area { min-width: 0; }
.simulator-panel { position: sticky; top: 24px; display: flex; justify-content: center; }

/* ═══════════════════════════════════════════════
   BetterFeel Mobile — Explore/Series View
   Matches Flutter app_theme.dart dark mode tokens
   ═══════════════════════════════════════════════ */
.bf-app {
  font-family: 'Inter', -apple-system, 'SF Pro Display', system-ui, sans-serif;
  background: #0A0A0A;
  min-height: 100%;
  position: relative;
}

/* Explore Header */
.bf-explore-header {
  background: linear-gradient(to bottom, rgba(10, 132, 255, 0.25), #0A0A0A);
  padding: 16px 16px 12px;
}
.bf-explore-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.bf-explore-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}
.bf-search-icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: #1C1C1E;
  border-radius: 10px;
  font-size: 14px;
}

/* Category Chips */
.bf-chips-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.bf-chips-row::-webkit-scrollbar { display: none; }
.bf-chip {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  color: #9CA3AF;
  background: #1C1C1E;
  border: 1px solid #2C2C2E;
  white-space: nowrap;
  flex-shrink: 0;
}
.bf-chip-active {
  background: #0A84FF;
  color: #fff;
  border-color: #0A84FF;
  font-weight: 600;
}

/* Featured Series */
.bf-featured-section { padding: 16px; }
.bf-featured-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.bf-featured-label {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}
.bf-see-all {
  font-size: 11px;
  color: #0A84FF;
  font-weight: 500;
}
.bf-series-count {
  font-size: 11px;
  color: #9CA3AF;
}

.bf-featured-card {
  height: 130px;
  border-radius: 16px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  position: relative;
}
.bf-featured-overlay {
  padding: 14px;
  width: 100%;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
}
.bf-featured-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  font-size: 8px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.bf-featured-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
.bf-featured-meta {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  margin-top: 2px;
}

/* Programs Section */
.bf-programs-section { padding: 0 16px 16px; }

.bf-empty {
  text-align: center;
  padding: 24px 0;
}
.bf-empty-icon { font-size: 28px; margin-bottom: 6px; }
.bf-empty-text { font-size: 11px; color: #9CA3AF; }

.bf-program-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #1C1C1E;
  border-radius: 16px;
  border: 1px solid #2C2C2E;
  margin-bottom: 8px;
}
.bf-program-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bf-program-count {
  font-size: 16px;
  font-weight: 800;
  color: rgba(255,255,255,0.9);
}
.bf-program-info { flex: 1; min-width: 0; }
.bf-program-title {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bf-program-meta {
  font-size: 10px;
  color: #9CA3AF;
  margin-top: 2px;
}
.bf-pub { color: #22C55E; }
.bf-draft { color: #F59E0B; }
.bf-arrow { font-size: 20px; color: #9CA3AF; flex-shrink: 0; }

/* Category Grid */
.bf-category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.bf-cat-item {
  padding: 16px 10px;
  border-radius: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.bf-cat-emoji { font-size: 22px; }
.bf-cat-name { font-size: 11px; font-weight: 600; color: #fff; }

/* Bottom Nav */
.bf-bottom-nav {
  position: absolute;
  bottom: 0; left: 0; right: 0;
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
.bf-nav-label-active { color: #fff; font-weight: 600; }
.bf-nav-avatar-inactive {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: 1.5px solid rgba(255,255,255,0.16);
  color: rgba(255,255,255,0.54);
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

@media (max-width: 1100px) {
  .series-main-layout { grid-template-columns: 1fr; }
  .simulator-panel { position: static; margin-top: 20px; }
}
</style>
