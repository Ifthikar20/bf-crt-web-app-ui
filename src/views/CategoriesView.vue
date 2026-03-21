<script setup>
import { ref, onMounted } from 'vue'
import { categoryApi } from '../api'

const categories = ref([])
const showForm = ref(false)
const editingCategory = ref(null)
const form = ref({ name: '', slug: '', description: '' })
const loading = ref(true)

onMounted(fetchCategories)

async function fetchCategories() {
  loading.value = true
  try {
    const { data } = await categoryApi.list()
    categories.value = data.categories || []
  } catch (err) { console.error('Failed:', err) }
  finally { loading.value = false }
}

function openCreate() { form.value = { name: '', slug: '', description: '' }; editingCategory.value = null; showForm.value = true }
function openEdit(cat) { form.value = { ...cat }; editingCategory.value = cat; showForm.value = true }

async function saveCategory() {
  try {
    if (editingCategory.value) { await categoryApi.update(editingCategory.value.id, form.value) }
    else { await categoryApi.create(form.value) }
    showForm.value = false
    fetchCategories()
  } catch (err) { console.error('Save failed:', err) }
}

function autoSlug() {
  if (!editingCategory.value) { form.value.slug = form.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="subtitle-label">Organization</div>
        <h2>Categories</h2>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Category
      </button>
    </div>

    <div class="card-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
      <div v-if="loading" class="empty-state" style="grid-column:1/-1; padding:40px"><div class="spinner" style="margin:0 auto"></div></div>
      <div v-else-if="categories.length === 0" class="empty-state" style="grid-column:1/-1;">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-muted)" fill="none" stroke-width="1.5" style="margin:0 auto 16px;display:block;"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <h3>No categories yet</h3>
        <p>Create your first category to organize content.</p>
      </div>
      <div v-for="cat in categories" :key="cat.id" class="card" style="cursor:pointer; position:relative;" @click="openEdit(cat)">
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px;">
          <div style="width:44px; height:44px; border-radius:12px; background:var(--purple-bg); display:flex; align-items:center; justify-content:center; color:var(--purple);">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div style="flex:1">
            <h4 style="font-size:15px; font-weight:600;">{{ cat.name }}</h4>
            <div style="display:inline-flex; padding:2px 8px; background:#f1f5f9; border-radius:4px; font-size:11px; font-weight:600; color:var(--text-muted); margin-top:4px;">{{ cat.slug }}</div>
          </div>
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="var(--text-muted)" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <p v-if="cat.description" style="font-size:13px; color:var(--text-secondary); line-height:1.5;">{{ cat.description }}</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingCategory ? 'Edit' : 'Create' }} Category</h3>
          <button class="modal-close" @click="showForm = false">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input v-model="form.name" @input="autoSlug" class="form-input" placeholder="Category name" />
        </div>
        <div class="form-group">
          <label class="form-label">Slug</label>
          <input v-model="form.slug" class="form-input" placeholder="category-slug" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-textarea" placeholder="Optional description"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showForm = false">Cancel</button>
          <button class="btn btn-primary" @click="saveCategory">{{ editingCategory ? 'Update' : 'Create' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
