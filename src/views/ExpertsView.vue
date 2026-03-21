<script setup>
import { ref, onMounted } from 'vue'
import { expertApi } from '../api'

const experts = ref([])
const showForm = ref(false)
const editingExpert = ref(null)
const form = ref({ name: '', description: '', photo_url: '', is_active: true })
const loading = ref(true)

onMounted(async () => {
  await fetchExperts()
})

async function fetchExperts() {
  loading.value = true
  try {
    const { data } = await expertApi.list()
    experts.value = data.experts || []
  } catch (err) { console.error('Failed:', err) }
  finally { loading.value = false }
}

function openCreate() { form.value = { name: '', description: '', photo_url: '', is_active: true }; editingExpert.value = null; showForm.value = true }
function openEdit(expert) { form.value = { ...expert }; editingExpert.value = expert; showForm.value = true }

async function saveExpert() {
  try {
    if (editingExpert.value) { await expertApi.update(editingExpert.value.id, form.value) }
    else { await expertApi.create(form.value) }
    showForm.value = false
    fetchExperts()
  } catch (err) { console.error('Save failed:', err) }
}

async function toggleActive(expert) {
  try { await expertApi.update(expert.id, { is_active: !expert.is_active }); fetchExperts() }
  catch (err) { console.error('Toggle failed:', err) }
}

function getInitials(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="subtitle-label">Team Management</div>
        <h2>Experts & Speakers</h2>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Expert
      </button>
    </div>

    <div class="table-container">
      <div v-if="loading" class="empty-state" style="padding:40px"><div class="spinner" style="margin:0 auto"></div></div>
      <div v-else-if="experts.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-muted)" fill="none" stroke-width="1.5" style="margin:0 auto 16px;display:block;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <h3>No experts yet</h3>
        <p>Add your first expert or speaker to get started.</p>
      </div>
      <table v-else>
        <thead><tr><th>Expert</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="expert in experts" :key="expert.id">
            <td>
              <div class="content-row">
                <div class="content-thumb" style="border-radius:50%; background:linear-gradient(135deg,#6366f1,#818cf8); color:white; font-size:13px; font-weight:700;">
                  {{ getInitials(expert.name) }}
                </div>
                <div class="content-row-info"><div class="content-title">{{ expert.name }}</div></div>
              </div>
            </td>
            <td style="color:var(--text-secondary); font-size:13px; max-width:300px;">{{ expert.description?.substring(0, 80) || '—' }}{{ expert.description?.length > 80 ? '...' : '' }}</td>
            <td><span class="badge" :class="expert.is_active ? 'badge-published' : 'badge-archived'">{{ expert.is_active ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-sm btn-secondary" @click="openEdit(expert)">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button class="btn btn-sm" :class="expert.is_active ? 'btn-danger' : 'btn-success'" @click="toggleActive(expert)">
                  {{ expert.is_active ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingExpert ? 'Edit' : 'Add' }} Expert</h3>
          <button class="modal-close" @click="showForm = false">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input v-model="form.name" class="form-input" placeholder="Expert name" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-textarea" placeholder="Brief bio"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Photo URL</label>
          <input v-model="form.photo_url" class="form-input" placeholder="https://..." />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showForm = false">Cancel</button>
          <button class="btn btn-primary" @click="saveExpert">{{ editingExpert ? 'Update' : 'Create' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
