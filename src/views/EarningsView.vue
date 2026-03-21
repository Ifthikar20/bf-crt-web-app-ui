<script setup>
import { ref, computed, onMounted } from 'vue'
import { earningsApi } from '../api'

const loading = ref(true)
const error = ref(null)

const earningsData = ref({
  totalEarned: 0,
  pendingBalance: 0,
  nextPayout: null,
  viewsThreshold: 10000,
  currentViews: 0,
  stripeConnected: false,
  payoutHistory: [],
  monthlyEarnings: [0, 0, 0, 0, 0, 0],
  monthLabels: ['', '', '', '', '', ''],
  payoutRate: {
    baseRate: 0.035,
    bonusRate: 0.005,
    bonusThreshold: 10000,
  },
})

const viewsProgress = computed(() => {
  if (!earningsData.value.viewsThreshold) return 0
  return Math.round((earningsData.value.currentViews / earningsData.value.viewsThreshold) * 100)
})
const viewsRemaining = computed(() => earningsData.value.viewsThreshold - earningsData.value.currentViews)

const maxMonthly = computed(() => Math.max(...earningsData.value.monthlyEarnings, 1))

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function fetchEarnings() {
  loading.value = true
  error.value = null
  try {
    const { data } = await earningsApi.getEarnings()
    earningsData.value = { ...earningsData.value, ...data }
  } catch (err) {
    error.value = 'Failed to load earnings data'
    console.error('Earnings fetch error:', err)
  } finally {
    loading.value = false
  }
}

async function connectStripe() {
  try {
    const { data } = await earningsApi.connectStripe()
    if (data.onboarding_url) {
      window.location.href = data.onboarding_url
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to connect Stripe'
    console.error('Stripe connect error:', err)
  }
}

async function checkStripeStatus() {
  try {
    const { data } = await earningsApi.getStripeStatus()
    earningsData.value.stripeConnected = data.connected
  } catch {
    // Silently fail -- earnings data has the status too
  }
}

onMounted(async () => {
  await fetchEarnings()
  await checkStripeStatus()
})
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="subtitle-label">Monetization</div>
        <h2>Earnings & Payouts</h2>
      </div>
      <button class="btn btn-primary" v-if="earningsData.stripeConnected">
        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Payout Settings
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" style="text-align:center; padding:80px 0; color:var(--text-muted);">
      <div class="spinner" style="margin:0 auto 16px;"></div>
      Loading earnings data...
    </div>

    <!-- Error State -->
    <div v-else-if="error" style="text-align:center; padding:80px 0;">
      <p style="color:var(--danger); margin-bottom:16px;">{{ error }}</p>
      <button class="btn btn-secondary" @click="fetchEarnings">Retry</button>
    </div>

    <template v-else>
    <!-- Stats Row -->
    <div class="card-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 28px;">
      <div class="earnings-card">
        <div class="earnings-card-header">
          <h3>Total Earned</h3>
          <div style="width:40px; height:40px; border-radius:var(--radius-sm); background:var(--success-bg); display:flex; align-items:center; justify-content:center; color:var(--success);">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        <div class="earnings-big-value" style="color: var(--success);">{{ formatCurrency(earningsData.totalEarned) }}</div>
        <div class="earnings-sub">Lifetime earnings from content</div>
      </div>

      <div class="earnings-card">
        <div class="earnings-card-header">
          <h3>Pending Balance</h3>
          <div style="width:40px; height:40px; border-radius:var(--radius-sm); background:var(--warning-bg); display:flex; align-items:center; justify-content:center; color:var(--warning);">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <div class="earnings-big-value">{{ formatCurrency(earningsData.pendingBalance) }}</div>
        <div class="earnings-sub">Next payout on {{ formatDate(earningsData.nextPayout) }}</div>
      </div>

      <div class="earnings-card">
        <div class="earnings-card-header">
          <h3>Views to Next Payout</h3>
          <div style="width:40px; height:40px; border-radius:var(--radius-sm); background:var(--purple-bg); display:flex; align-items:center; justify-content:center; color:var(--purple);">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </div>
        <div class="earnings-big-value">{{ formatNumber(earningsData.currentViews) }}</div>
        <div class="threshold-bar">
          <div class="threshold-labels">
            <span>{{ viewsProgress }}% complete</span>
            <span>{{ formatNumber(viewsRemaining) }} views remaining</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" :style="{ width: viewsProgress + '%' }"></div></div>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-grid">
      <!-- Left: Payout History -->
      <div>
        <div class="earnings-card" style="padding: 0;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:20px 24px 16px;">
            <h3 style="font-size:18px; font-weight:700">Payout History</h3>
            <span style="font-size:13px; color:var(--text-muted); font-weight:500;">{{ earningsData.payoutHistory.length }} payouts</span>
          </div>
          <table v-if="earningsData.payoutHistory.length">
            <thead><tr><th>Payout</th><th>Views</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="payout in earningsData.payoutHistory" :key="payout.id">
                <td>
                  <div class="content-row">
                    <div class="content-thumb" style="border-radius:var(--radius-sm); background:var(--success-bg); color:var(--success);">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    </div>
                    <div class="content-row-info">
                      <div class="content-title">{{ payout.description }}</div>
                      <div class="content-sub">{{ formatDate(payout.date) }}</div>
                    </div>
                  </div>
                </td>
                <td style="font-weight:500; color:var(--text-secondary);">{{ formatNumber(payout.views) }}</td>
                <td style="font-weight:700; color:var(--success);">{{ formatCurrency(payout.amount) }}</td>
                <td>
                  <span class="badge" :class="payout.status === 'completed' ? 'badge-published' : payout.status === 'failed' ? 'badge-archived' : 'badge-draft'">
                    {{ payout.status.charAt(0).toUpperCase() + payout.status.slice(1) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else style="padding:40px 24px; text-align:center; color:var(--text-muted); font-size:14px;">
            No payouts yet. Earnings are paid out when your content reaches {{ formatNumber(earningsData.viewsThreshold) }} views.
          </div>
        </div>
      </div>

      <!-- Right: Earnings Chart + Bank Connection -->
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- Monthly Chart -->
        <div class="earnings-card">
          <div class="health-section-header" style="margin-bottom:16px;">
            <span class="health-section-title">Monthly Earnings</span>
            <span class="health-section-period">Last 6 months</span>
          </div>
          <div class="bar-chart" style="height:120px;">
            <div v-for="(val, i) in earningsData.monthlyEarnings" :key="i" style="display:flex; flex-direction:column; align-items:center; flex:1; gap:6px; height:100%; justify-content:flex-end;">
              <span style="font-size:11px; font-weight:600; color:var(--text-muted);">{{ formatCurrency(val) }}</span>
              <div class="bar" :class="{ current: i === earningsData.monthlyEarnings.length - 1 }" :style="{ height: (val / maxMonthly * 100) + '%', background: i === earningsData.monthlyEarnings.length - 1 ? 'var(--success)' : '#e2e8f0' }"></div>
              <span style="font-size:11px; color:var(--text-muted);">{{ earningsData.monthLabels[i] }}</span>
            </div>
          </div>
        </div>

        <!-- Bank / Stripe Connection -->
        <div class="earnings-card" v-if="!earningsData.stripeConnected">
          <div style="text-align:center; padding:16px 0;">
            <div style="width:56px; height:56px; border-radius:var(--radius); background:var(--purple-bg); display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px; color:var(--purple);">
              <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <h3 style="font-size:16px; font-weight:700; margin-bottom:6px;">Connect Your Bank</h3>
            <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:20px;">Link your bank account via Stripe to receive automatic payouts when you hit view milestones.</p>
            <button class="btn btn-primary" @click="connectStripe" style="width:100%; justify-content:center;">
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Connect with Stripe
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div class="earnings-card" v-else>
          <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
            <div style="width:44px; height:44px; border-radius:var(--radius-sm); background:var(--success-bg); display:flex; align-items:center; justify-content:center; color:var(--success);">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style="font-size:14px; font-weight:600;">Bank Account Connected</div>
              <div style="font-size:12px; color:var(--text-muted);">Payouts via Stripe</div>
            </div>
          </div>
          <div class="tip-card" style="margin-top:0;">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div><div class="tip-title">How Payouts Work</div><div class="tip-text">When your content reaches {{ formatNumber(earningsData.viewsThreshold) }} views in a billing cycle, we automatically calculate your earnings and transfer funds to your connected bank account within 3-5 business days.</div></div>
          </div>
        </div>

        <!-- Payout Rate Info -->
        <div class="earnings-card">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted); margin-bottom:16px;">Payout Rate</div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-light);">
              <span style="font-size:14px; font-weight:500;">Base Rate</span>
              <span style="font-size:14px; font-weight:700;">${{ earningsData.payoutRate?.baseRate || '0.035' }} / view</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-light);">
              <span style="font-size:14px; font-weight:500;">Bonus ({{ formatNumber(earningsData.payoutRate?.bonusThreshold || 10000) }}+ views)</span>
              <span style="font-size:14px; font-weight:700; color:var(--success);">+${{ earningsData.payoutRate?.bonusRate || '0.005' }} / view</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0;">
              <span style="font-size:14px; font-weight:500;">Payout Threshold</span>
              <span style="font-size:14px; font-weight:700;">{{ formatNumber(earningsData.viewsThreshold) }} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
