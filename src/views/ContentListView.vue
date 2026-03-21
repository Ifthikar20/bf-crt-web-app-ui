<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { contentApi, categoryApi } from '../api'

const content = ref([])
const categories = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const categoryFilter = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const perPage = 4
const openMenuId = ref(null)

async function fetchContent() {
  loading.value = true
  try {
    const params = {}
    if (statusFilter.value) params.status = statusFilter.value
    if (typeFilter.value) params.content_type = typeFilter.value
    if (categoryFilter.value) params.category = categoryFilter.value
    if (search.value) params.search = search.value
    if (activeTab.value === 'published') params.status = 'published'
    if (activeTab.value === 'drafts') params.status = 'draft'
    const { data } = await contentApi.list(params)
    content.value = data.content || []
  } catch (err) {
    console.error('Failed to load content:', err)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const { data } = await categoryApi.list()
    categories.value = data.categories || []
  } catch (err) { /* ignore */ }
}

onMounted(() => { fetchContent(); fetchCategories() })
watch([statusFilter, typeFilter, categoryFilter, activeTab], () => { currentPage.value = 1; fetchContent() })

let searchTimeout
function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { currentPage.value = 1; fetchContent() }, 400)
}

function setTab(tab) { activeTab.value = tab; statusFilter.value = '' }

const totalItems = computed(() => content.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / perPage)))
const paginatedContent = computed(() => content.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))
const totalViews = computed(() => content.value.reduce((s, c) => s + (c.view_count || 0), 0))
const scheduledCount = computed(() => content.value.filter(c => c.status === 'pending_review').length)

async function publishItem(id) { await contentApi.publish(id); fetchContent(); openMenuId.value = null }
async function unpublishItem(id) { await contentApi.unpublish(id); fetchContent(); openMenuId.value = null }
async function archiveItem(id) { if (!confirm('Archive this content?')) return; await contentApi.archive(id); fetchContent(); openMenuId.value = null }
function toggleMenu(id) { openMenuId.value = openMenuId.value === id ? null : id }

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => { if (!e.target.closest('.actions-cell')) openMenuId.value = null })
}
</script>

<template>
  <div @click="openMenuId = null">
    <!-- Search -->
    <div style="margin-bottom: 24px;">
      <div class="search-bar">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" @input="onSearch" placeholder="Search your library..." />
      </div>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="subtitle-label">Content Manager</div>
        <h2>My Content Library</h2>
      </div>
      <div class="tab-filters">
        <button class="tab-filter" :class="{ active: activeTab === 'all' }" @click="setTab('all')">All Assets</button>
        <button class="tab-filter" :class="{ active: activeTab === 'published' }" @click="setTab('published')">Published</button>
        <button class="tab-filter" :class="{ active: activeTab === 'drafts' }" @click="setTab('drafts')">Drafts</button>
      </div>
    </div>

    <!-- Filter Pills -->
    <div class="filter-pills" style="margin-bottom: 20px;">
      <div class="filter-pill">
        <span class="pill-label">Status:</span>
        <select v-model="statusFilter" class="pill-select">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending_review">Pending Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div class="filter-pill">
        <span class="pill-label">Type:</span>
        <select v-model="typeFilter" class="pill-select">
          <option value="">All Types</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="article">Article</option>
        </select>
      </div>
      <div class="filter-pill">
        <span class="pill-label">Category:</span>
        <select v-model="categoryFilter" class="pill-select">
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c.id" :value="c.slug">{{ c.name }}</option>
        </select>
      </div>
      <div class="filter-pill advanced-toggle" style="margin-left:auto">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
        Advanced Filters
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <div v-if="loading" class="empty-state" style="padding:40px;"><div class="spinner" style="margin:0 auto"></div></div>
      <div v-else-if="content.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-muted)" fill="none" stroke-width="1.5" style="margin:0 auto 16px;display:block;"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
        <h3>No content found</h3>
        <p>Create your first content or adjust filters.</p>
      </div>
      <template v-else>
        <table>
          <thead><tr><th>Content Title</th><th>Type</th><th>Status</th><th>Analytics</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="item in paginatedContent" :key="item.id">
              <td>
                <div class="content-row">
                  <div class="content-thumb-img" :class="item.content_type">
                    <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.title" />
                    <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="rgba(255,255,255,0.6)" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <polygon v-if="item.content_type==='video'" points="23 7 16 12 23 17 23 7"/><rect v-if="item.content_type==='video'" x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      <path v-if="item.content_type==='audio'" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path v-if="item.content_type==='audio'" d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <path v-if="item.content_type==='article'" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline v-if="item.content_type==='article'" points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div class="content-row-info">
                    <div class="content-title">{{ item.title }}</div>
                    <div class="content-sub">{{ timeAgo(item.updated_at) }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="type-badge" :class="{ series: item.series_id }">
                  <svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  {{ item.series_id ? 'Series' : item.content_type }}
                </span>
              </td>
              <td><span class="status-dot" :class="item.status">{{ item.status === 'pending_review' ? 'Scheduled' : item.status?.replace('_', ' ') }}</span></td>
              <td>
                <div class="analytics-cell">
                  <span class="analytics-value">{{ formatNumber(item.view_count || 0) }} views</span>
                  <span v-if="item.view_count" class="analytics-growth">+{{ Math.floor(Math.random() * 45 + 5) }}% this week</span>
                  <span v-else-if="item.status==='pending_review'" class="analytics-pending">Pending release</span>
                  <span v-else class="analytics-nodata">No data</span>
                </div>
              </td>
              <td class="actions-cell" @click.stop>
                <button class="actions-dots" @click="toggleMenu(item.id)">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
                <div v-if="openMenuId === item.id" class="actions-dropdown">
                  <router-link :to="`/content/${item.id}/edit`" class="dropdown-item">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </router-link>
                  <button v-if="item.status !== 'published'" @click="publishItem(item.id)" class="dropdown-item">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Publish
                  </button>
                  <button v-if="item.status === 'published'" @click="unpublishItem(item.id)" class="dropdown-item">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    Unpublish
                  </button>
                  <button @click="archiveItem(item.id)" class="dropdown-item danger">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Archive
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <span class="pagination-info">Showing {{ paginatedContent.length }} of {{ totalItems }} items</span>
          <div class="pagination-controls">
            <button class="pagination-btn" :disabled="currentPage <= 1" @click="currentPage--">Previous</button>
            <button v-for="p in totalPages" :key="p" class="pagination-btn" :class="{ active: currentPage === p }" @click="currentPage = p">{{ p }}</button>
            <button class="pagination-btn" :disabled="currentPage >= totalPages" @click="currentPage++">Next</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Summary Stats -->
    <div class="summary-stats">
      <div class="summary-stat highlight">
        <div class="summary-stat-label">Total Library Reach</div>
        <div class="summary-stat-value">{{ formatNumber(totalViews) }}</div>
        <div class="summary-stat-sub">Lifetime views across {{ content.length }} videos</div>
      </div>
      <div class="summary-stat">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="summary-stat-label">Top Category</div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <div class="summary-stat-value" style="font-size:22px; margin-top:4px;">Studio Tech</div>
        <div class="summary-stat-sub">45% of total engagement</div>
      </div>
      <div class="summary-stat">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="summary-stat-label">Upcoming</div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="summary-stat-value" style="font-size:22px; margin-top:4px;">{{ scheduledCount }} Scheduled</div>
        <div class="summary-stat-sub">Next release in 14 hours</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pill-select { border:none; background:none; font-size:13px; color:var(--text-primary); font-weight:600; outline:none; cursor:pointer; font-family:inherit; appearance:auto; }
.advanced-toggle { gap:8px; font-weight:500; color:var(--text-secondary); }
.content-thumb-img { width:56px; height:40px; border-radius:6px; background:#1e293b; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
.content-thumb-img.audio { background:linear-gradient(135deg,#312e81,#4338ca); }
.content-thumb-img.article { background:linear-gradient(135deg,#064e3b,#065f46); }
.content-thumb-img img { width:100%; height:100%; object-fit:cover; }
.analytics-cell { display:flex; flex-direction:column; gap:2px; }
.analytics-value { font-weight:600; font-size:14px; }
.analytics-growth { font-size:12px; font-weight:500; color:var(--success); }
.analytics-pending { font-size:12px; font-weight:500; color:var(--warning); font-style:italic; }
.analytics-nodata { font-size:12px; color:var(--text-muted); font-style:italic; }
.actions-cell { position:relative; }
.actions-dots { width:32px; height:32px; border:none; background:none; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; justify-content:center; border-radius:6px; transition:all 0.15s ease; }
.actions-dots:hover { background:#f1f5f9; color:var(--text-primary); }
.actions-dropdown { position:absolute; right:0; top:100%; background:var(--bg-white); border:1px solid var(--border); border-radius:10px; padding:6px; min-width:160px; box-shadow:0 8px 24px rgba(0,0,0,0.12); z-index:30; animation:fadeIn 0.15s ease; }
.dropdown-item { display:flex; align-items:center; gap:8px; width:100%; padding:9px 12px; font-size:13px; font-weight:500; color:var(--text-primary); background:none; border:none; border-radius:7px; cursor:pointer; transition:background 0.12s ease; text-decoration:none; font-family:inherit; }
.dropdown-item:hover { background:#f1f5f9; }
.dropdown-item.danger { color:var(--danger); }
.dropdown-item.danger:hover { background:var(--danger-bg); }
</style>
