<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { contentApi, categoryApi, expertApi } from '../api'

const currentStep = ref(1)
const form = ref({ title: '', description: '', content_type: 'video', category: '', expert: '', status: 'draft' })
const categories = ref([])
const experts = ref([])
const tags = ref([])
const newTag = ref('')
const showTagInput = ref(false)
const videoFile = ref(null)
const thumbnailFile = ref(null)
const videoPreviewUrl = ref(null)
const thumbnailPreviewUrl = ref(null)
const saving = ref(false)
const toast = ref(null)
const createdContentId = ref(null)

const steps = [
  { num: 1, label: 'Details' },
  { num: 2, label: 'Media' },
  { num: 3, label: 'Visibility' },
  { num: 4, label: 'Review' },
]

const setupItems = computed(() => [
  { label: 'Content title', done: !!form.value.title },
  { label: 'Description', done: !!form.value.description },
  { label: 'Category selected', done: !!form.value.category },
  { label: 'Upload media', done: !!videoFile.value },
  { label: 'Add thumbnail', done: !!thumbnailFile.value },
])

const setupProgress = computed(() => {
  const done = setupItems.value.filter(i => i.done).length
  return Math.round((done / setupItems.value.length) * 100)
})

onMounted(async () => {
  try {
    const [catRes, expRes] = await Promise.all([
      categoryApi.list().catch(() => ({ data: { categories: [] } })),
      expertApi.list().catch(() => ({ data: { experts: [] } })),
    ])
    categories.value = catRes.data?.categories || []
    experts.value = expRes.data?.experts || []
  } catch (err) { console.error('Failed to load options:', err) }
})

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) { tags.value.push(tag); newTag.value = ''; showTagInput.value = false }
}

function removeTag(index) { tags.value.splice(index, 1) }

function onVideoChange(e) {
  const file = e.target.files[0]
  if (file) { videoFile.value = file; videoPreviewUrl.value = URL.createObjectURL(file) }
}

function onThumbnailChange(e) {
  const file = e.target.files[0]
  if (file) { thumbnailFile.value = file; thumbnailPreviewUrl.value = URL.createObjectURL(file) }
}

async function saveDraft() {
  saving.value = true
  try {
    let id = createdContentId.value
    if (!id) {
      const { data } = await contentApi.create({ ...form.value, tags: tags.value })
      id = data.content?.id || data.id
      createdContentId.value = id
    } else {
      await contentApi.update(id, { ...form.value, tags: tags.value })
    }
    if (videoFile.value && id) await contentApi.uploadVideo(id, videoFile.value).catch(console.error)
    if (thumbnailFile.value && id) await contentApi.uploadThumbnail(id, thumbnailFile.value).catch(console.error)
    showToast('Draft saved successfully!', 'success')
  } catch (err) {
    console.error('Save failed:', err)
    showToast('Save failed. Please check your inputs.', 'error')
  } finally {
    saving.value = false
  }
}

async function publishContent() {
  await saveDraft()
  if (createdContentId.value) {
    try {
      await contentApi.publish(createdContentId.value)
      showToast('Content published!', 'success')
    } catch (err) { showToast('Publish failed.', 'error') }
  }
}

function showToast(message, type = 'success') {
  toast.value = { message, type }
  setTimeout(() => { toast.value = null }, 3000)
}

function nextStep() { if (currentStep.value < 4) currentStep.value++ }
function prevStep() { if (currentStep.value > 1) currentStep.value-- }
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <div class="subtitle-label">Content Wizard</div>
        <h2>Create New Content</h2>
      </div>
    </div>

    <!-- Steps -->
    <div class="steps">
      <div v-for="s in steps" :key="s.num" class="step" :class="{ active: currentStep === s.num, done: currentStep > s.num }">
        <div class="step-number">
          <svg v-if="currentStep > s.num" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span v-else>{{ s.num }}</span>
        </div>
        <span class="step-label">{{ s.label }}</span>
      </div>
    </div>

    <!-- Content Layout -->
    <div class="content-detail-layout">
      <div class="detail-form">
        <!-- Step 1: Details -->
        <template v-if="currentStep === 1">
          <h3 style="font-size:18px; font-weight:700; margin-bottom:24px;">Content Details</h3>
          <div class="form-group">
            <label class="form-label">Title</label>
            <input v-model="form.title" class="form-input" placeholder="Enter a compelling title..." />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-textarea" placeholder="Describe your content..."></textarea>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select v-model="form.category" class="form-select">
                <option value="">Select category</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Expert</label>
              <select v-model="form.expert" class="form-select">
                <option value="">Select expert</option>
                <option v-for="e in experts" :key="e.id" :value="e.id">{{ e.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tags</label>
            <div class="tag-list">
              <span v-for="(tag, i) in tags" :key="i" class="tag-chip">
                {{ tag }}
                <span class="remove-tag" @click="removeTag(i)">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </span>
              </span>
              <input v-if="showTagInput" v-model="newTag" @keyup.enter="addTag" @blur="addTag" class="form-input" style="width:120px; padding:6px 10px; font-size:13px;" placeholder="Add tag..." autofocus />
              <button v-else class="add-tag-btn" @click="showTagInput = true">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Tag
              </button>
            </div>
          </div>
        </template>

        <!-- Step 2: Media -->
        <template v-if="currentStep === 2">
          <h3 style="font-size:18px; font-weight:700; margin-bottom:24px;">Upload Media</h3>
          <div class="form-group">
            <label class="form-label">Content Type</label>
            <select v-model="form.content_type" class="form-select">
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="article">Article</option>
            </select>
          </div>
          <div class="upload-zone" @click="$refs.videoInput.click()">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="var(--text-muted)" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px; display:block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p v-if="videoFile"><strong>{{ videoFile.name }}</strong></p>
            <p v-else>Click to upload or drag and drop your file</p>
            <input ref="videoInput" type="file" accept="video/*,audio/*" @change="onVideoChange" style="display:none" />
          </div>
          <div class="form-group" style="margin-top:20px">
            <label class="form-label">Thumbnail Image</label>
            <div class="upload-zone" @click="$refs.thumbInput.click()" style="padding:24px">
              <img v-if="thumbnailPreviewUrl" :src="thumbnailPreviewUrl" style="max-width:200px; border-radius:8px; margin:0 auto; display:block;" />
              <p v-else>Click to upload thumbnail</p>
              <input ref="thumbInput" type="file" accept="image/*" @change="onThumbnailChange" style="display:none" />
            </div>
          </div>
        </template>

        <!-- Step 3: Visibility -->
        <template v-if="currentStep === 3">
          <h3 style="font-size:18px; font-weight:700; margin-bottom:24px;">Visibility Settings</h3>
          <div class="form-group">
            <label class="form-label">Publish Status</label>
            <select v-model="form.status" class="form-select">
              <option value="draft">Save as Draft</option>
              <option value="pending_review">Submit for Review</option>
            </select>
          </div>
          <div class="tip-card">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div><div class="tip-title">Publishing Tip</div><div class="tip-text">Content submitted for review typically goes live within 24 hours. Make sure your media and metadata are complete before submitting.</div></div>
          </div>
        </template>

        <!-- Step 4: Review -->
        <template v-if="currentStep === 4">
          <h3 style="font-size:18px; font-weight:700; margin-bottom:24px;">Review & Publish</h3>
          <div class="card" style="margin-bottom: 16px;">
            <div style="font-size:12px; text-transform:uppercase; font-weight:700; color:var(--text-muted); letter-spacing:.06em; margin-bottom:8px;">Title</div>
            <div style="font-size:16px; font-weight:600;">{{ form.title || 'Untitled' }}</div>
          </div>
          <div class="card" style="margin-bottom: 16px;">
            <div style="font-size:12px; text-transform:uppercase; font-weight:700; color:var(--text-muted); letter-spacing:.06em; margin-bottom:8px;">Description</div>
            <div style="font-size:14px; color:var(--text-secondary); line-height:1.5;">{{ form.description || 'No description' }}</div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="card">
              <div style="font-size:12px; text-transform:uppercase; font-weight:700; color:var(--text-muted); letter-spacing:.06em; margin-bottom:8px;">Type</div>
              <div style="font-weight:600;">{{ form.content_type }}</div>
            </div>
            <div class="card">
              <div style="font-size:12px; text-transform:uppercase; font-weight:700; color:var(--text-muted); letter-spacing:.06em; margin-bottom:8px;">Status</div>
              <div style="font-weight:600;">{{ form.status?.replace('_', ' ') }}</div>
            </div>
          </div>
        </template>
      </div>

      <!-- Sidebar -->
      <div class="detail-sidebar">
        <div class="video-preview-card">
          <div class="video-preview-thumb">
            <video v-if="videoPreviewUrl" :src="videoPreviewUrl" style="width:100%;height:100%;object-fit:cover;" muted></video>
            <div v-else class="play-btn">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
          <div class="video-preview-info">
            <div class="title">{{ form.title || 'Your Content' }}</div>
            <div class="meta">
              <span>{{ form.content_type }}</span>
              <span>{{ videoFile ? (videoFile.size / (1024*1024)).toFixed(1) + ' MB' : 'No file' }}</span>
            </div>
          </div>
        </div>

        <div class="tip-card">
          <svg viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 10 14.172l-.548-.547z"/></svg>
          <div><div class="tip-title">Optimization Tip</div><div class="tip-text">Videos with titles 40-60 characters perform 30% better in search results.</div></div>
        </div>

        <div class="setup-progress">
          <div class="setup-progress-title">Setup Progress — {{ setupProgress }}%</div>
          <div class="progress-bar" style="margin-bottom: 16px;"><div class="progress-fill" :style="{ width: setupProgress + '%' }"></div></div>
          <div v-for="item in setupItems" :key="item.label" class="setup-item">
            <div class="check" :class="item.done ? 'done' : 'pending'">
              <svg v-if="item.done" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span :style="{ color: item.done ? 'var(--text-primary)' : 'var(--text-muted)' }">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <button v-if="currentStep > 1" class="btn btn-secondary" @click="prevStep">
        <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </button>
      <span v-else></span>
      <div class="bottom-bar-right">
        <button class="btn btn-secondary" @click="saveDraft" :disabled="saving">Save as Draft</button>
        <button v-if="currentStep < 4" class="btn btn-primary" @click="nextStep">
          Continue
          <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
        <button v-else class="btn btn-primary teal" @click="publishContent" :disabled="saving">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Publish
        </button>
      </div>
    </div>

    <div v-if="toast" :class="['toast', 'toast-' + toast.type]">{{ toast.message }}</div>
  </div>
</template>
