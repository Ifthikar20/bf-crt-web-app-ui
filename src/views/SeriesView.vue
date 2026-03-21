<script setup>
import { ref, onMounted, computed } from 'vue'
import { seriesApi } from '../api'

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
</script>

<template>
  <div>
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
