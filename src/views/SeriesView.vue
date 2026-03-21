<script setup>
import { ref, onMounted } from 'vue'
import { seriesApi } from '../api'
import PhoneSimulator from '../components/PhoneSimulator.vue'

const seriesList = ref([])
const showForm = ref(false)
const showDetail = ref(null)
const form = ref({ title: '', description: '' })
const loading = ref(true)

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

// Colors for series cards in the simulator
const seriesColors = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
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

      <!-- Right: Phone Simulator -->
      <div class="simulator-panel">
        <PhoneSimulator label="iPhone 17 Pro">
          <div class="mobile-series">
            <!-- Mobile Header -->
            <div class="mob-header">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              <span class="mob-header-title">Series</span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>

            <!-- Featured Series Banner -->
            <div class="mob-featured">
              <div class="mob-featured-overlay">
                <div class="mob-featured-badge">FEATURED</div>
                <h4 class="mob-featured-title">{{ seriesList[0]?.title || 'Your Series' }}</h4>
                <p class="mob-featured-desc">{{ seriesList[0]?.description?.substring(0, 60) || 'Create a series to see it here' }}{{ seriesList[0]?.description?.length > 60 ? '...' : '' }}</p>
              </div>
            </div>

            <!-- Series Section -->
            <div class="mob-section">
              <div class="mob-section-header">
                <span class="mob-section-title">Your Series</span>
                <span class="mob-section-count">{{ seriesList.length }} total</span>
              </div>

              <!-- Empty State -->
              <div v-if="seriesList.length === 0" class="mob-empty">
                <div class="mob-empty-icon">📚</div>
                <p>No series yet</p>
              </div>

              <!-- Series Cards -->
              <div v-for="(series, idx) in seriesList" :key="series.id" class="mob-series-card">
                <div class="mob-series-thumb" :style="{ background: seriesColors[idx % seriesColors.length] }">
                  <div class="mob-series-ep-count">{{ series.episodes?.length || 0 }}</div>
                </div>
                <div class="mob-series-info">
                  <div class="mob-series-title">{{ series.title }}</div>
                  <div class="mob-series-meta">
                    <span :class="series.is_published ? 'mob-status-pub' : 'mob-status-draft'">
                      {{ series.is_published ? '● Published' : '○ Draft' }}
                    </span>
                    <span>· {{ series.episodes?.length || 0 }} episodes</span>
                  </div>
                </div>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>

            <!-- Discover Section -->
            <div class="mob-section">
              <div class="mob-section-header">
                <span class="mob-section-title">Discover</span>
                <span class="mob-section-count">Popular</span>
              </div>
              <div class="mob-discover-grid">
                <div class="mob-discover-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                  <span>🧘</span>
                  <div>Mindfulness</div>
                </div>
                <div class="mob-discover-card" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
                  <span>💪</span>
                  <div>Fitness</div>
                </div>
                <div class="mob-discover-card" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
                  <span>🥗</span>
                  <div>Nutrition</div>
                </div>
                <div class="mob-discover-card" style="background: linear-gradient(135deg, #fa709a, #fee140);">
                  <span>😴</span>
                  <div>Sleep</div>
                </div>
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

.simulator-panel {
  position: sticky;
  top: 24px;
  display: flex;
  justify-content: center;
}

/* ═══════ Mobile Series Preview ═══════ */
.mobile-series {
  font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  min-height: 100%;
  background: #f8f9fa;
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

.mob-featured {
  height: 140px;
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
  position: relative;
  display: flex;
  align-items: flex-end;
}
.mob-featured-overlay {
  padding: 14px;
  width: 100%;
  background: linear-gradient(transparent, rgba(0,0,0,0.45));
}
.mob-featured-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.mob-featured-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.mob-featured-desc {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  margin: 2px 0 0;
}

.mob-section {
  padding: 14px;
}
.mob-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.mob-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
}
.mob-section-count {
  font-size: 11px;
  color: #94a3b8;
}

.mob-empty {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
}
.mob-empty-icon { font-size: 28px; margin-bottom: 6px; }
.mob-empty p { font-size: 12px; margin: 0; }

.mob-series-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.mob-series-thumb {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mob-series-ep-count {
  font-size: 16px;
  font-weight: 800;
  color: rgba(255,255,255,0.9);
}
.mob-series-info {
  flex: 1;
  min-width: 0;
}
.mob-series-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mob-series-meta {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
  display: flex;
  gap: 4px;
}
.mob-status-pub { color: #16a34a; }
.mob-status-draft { color: #f59e0b; }

.mob-discover-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.mob-discover-card {
  padding: 14px 10px;
  border-radius: 12px;
  text-align: center;
  color: white;
}
.mob-discover-card span {
  font-size: 22px;
  display: block;
  margin-bottom: 4px;
}
.mob-discover-card div {
  font-size: 11px;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .series-main-layout { grid-template-columns: 1fr; }
  .simulator-panel { position: static; margin-top: 20px; }
}
</style>
