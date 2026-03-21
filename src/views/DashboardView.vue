<script setup>
import { ref, onMounted } from 'vue'
import { contentApi, dashboardApi } from '../api'
import { useAuthStore } from '../store'

const auth = useAuthStore()
const stats = ref({ total: 0, published: 0, pending: 0, views: 0 })
const recentContent = ref([])
const loading = ref(true)

const svgIcons = {
  eye: `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  film: `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>`,
  dollar: `<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  users: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  video: `<svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  mic: `<svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  file: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  inbox: `<svg viewBox="0 0 24 24" width="48" height="48"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  record: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`,
}

onMounted(async () => {
  try {
    const [dashRes, contentRes] = await Promise.all([
      dashboardApi.stats().catch(() => ({ data: {} })),
      contentApi.list({ limit: 5 }).catch(() => ({ data: { content: [] } })),
    ])

    if (dashRes.data) {
      stats.value = {
        total: dashRes.data.total_content || 0,
        published: dashRes.data.published_content || 0,
        pending: dashRes.data.pending_review || 0,
        views: dashRes.data.total_views || 0,
      }
    }

    const allContent = contentRes.data?.content || []
    recentContent.value = allContent.slice(0, 5)

    if (!dashRes.data?.total_content) {
      const allRes = await contentApi.list({ limit: 100 }).catch(() => ({ data: { content: [] } }))
      const all = allRes.data?.content || []
      stats.value = {
        total: all.length,
        published: all.filter(c => c.status === 'published').length,
        pending: all.filter(c => c.status === 'pending_review').length,
        views: all.reduce((sum, c) => sum + (c.view_count || 0), 0),
      }
    }
  } catch (err) {
    console.error('Dashboard error:', err)
  } finally {
    loading.value = false
  }
})

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
  return `${Math.floor(hours / 24)}d ago`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function getTypeIcon(type) {
  if (type === 'video') return svgIcons.video
  if (type === 'audio') return svgIcons.mic
  return svgIcons.file
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h2>{{ auth.displayName }}</h2>
        <p>Here's what's happening with your studio today</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="card-grid" style="grid-template-columns: repeat(4, 1fr)">
      <div class="stat-card">
        <div class="stat-icon purple" v-html="svgIcons.eye"></div>
        <div>
          <div class="stat-label">Total Views</div>
          <div class="stat-value">{{ formatNumber(stats.views) }}</div>
        </div>
        <span class="stat-growth" v-if="stats.views">+12.5%</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue" v-html="svgIcons.film"></div>
        <div>
          <div class="stat-label">My Content</div>
          <div class="stat-value">{{ formatNumber(stats.total) }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal" v-html="svgIcons.dollar"></div>
        <div>
          <div class="stat-label">Revenue</div>
          <div class="stat-value">${{ formatNumber(stats.published * 97) }}</div>
        </div>
        <span class="stat-growth" v-if="stats.published">+8.2%</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon green" v-html="svgIcons.users"></div>
        <div>
          <div class="stat-label">Subscribers</div>
          <div class="stat-value">{{ formatNumber(stats.views > 0 ? Math.floor(stats.views / 20) : 0) }}</div>
        </div>
        <span class="stat-growth" v-if="stats.views">+24%</span>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <div>
        <div class="card" style="padding: 0;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding: 20px 24px 16px;">
            <h3 style="font-size:18px; font-weight:700">Recent Content</h3>
            <router-link to="/content" class="btn btn-sm btn-secondary">View All</router-link>
          </div>

          <div v-if="loading" class="empty-state" style="padding: 40px;">
            <div class="spinner" style="margin: 0 auto"></div>
          </div>

          <div v-else-if="recentContent.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-muted)" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 16px; display:block;">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
            <h3>No content yet</h3>
            <p>Get started by creating your first piece of content.</p>
          </div>

          <table v-else>
            <thead>
              <tr><th>Title</th><th>Date</th><th>Views</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in recentContent" :key="item.id">
                <td>
                  <div class="content-row">
                    <div class="content-thumb" v-html="getTypeIcon(item.content_type)"></div>
                    <div class="content-row-info">
                      <div class="content-title">{{ item.title }}</div>
                      <div class="content-sub">{{ item.content_type }} · {{ timeAgo(item.updated_at) }}</div>
                    </div>
                  </div>
                </td>
                <td style="color: var(--text-secondary); font-size: 13px;">{{ formatDate(item.updated_at) }}</td>
                <td style="font-weight: 600;">{{ formatNumber(item.view_count || 0) }}</td>
                <td><span class="badge" :class="'badge-' + item.status">{{ item.status?.replace('_', ' ') }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Studio Health -->
      <div>
        <div class="studio-health">
          <h3>Studio Health</h3>
          <div class="health-section">
            <div class="health-section-header">
              <span class="health-section-title">Growth Rate</span>
              <span class="health-section-period">Monthly</span>
            </div>
            <div class="bar-chart">
              <div class="bar" style="height: 35%"></div>
              <div class="bar" style="height: 50%"></div>
              <div class="bar" style="height: 45%"></div>
              <div class="bar" style="height: 65%"></div>
              <div class="bar" style="height: 75%"></div>
              <div class="bar current" style="height: 90%"></div>
              <div class="bar" style="height: 60%"></div>
            </div>
            <p class="growth-note">Your channel has seen a <strong>15% increase</strong> in engagement since moving to daily uploads.</p>
          </div>
          <div class="health-section">
            <div class="health-section-header"><span class="health-section-title">Audience Interest</span></div>
            <div class="interest-list">
              <div class="interest-item"><span class="interest-label">Tech & Innovation</span><div class="interest-bar-bg"><div class="interest-bar-fill" style="width: 64%"></div></div><span class="interest-value">64%</span></div>
              <div class="interest-item"><span class="interest-label">Personal Finance</span><div class="interest-bar-bg"><div class="interest-bar-fill" style="width: 42%"></div></div><span class="interest-value">42%</span></div>
              <div class="interest-item"><span class="interest-label">Productivity</span><div class="interest-bar-bg"><div class="interest-bar-fill" style="width: 18%"></div></div><span class="interest-value">18%</span></div>
            </div>
          </div>
        </div>
        <div class="upgrade-banner">
          <h4>Upgrade to Pro</h4>
          <p>Unlock advanced analytics and team collaboration tools.</p>
          <button class="btn-outline">LEARN MORE</button>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <router-link to="/content/new" class="fab" style="text-decoration:none; color:white;">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
      Record Session
    </router-link>
  </div>
</template>
