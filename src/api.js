import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
})

// Inject auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('creator_token')
    if (token) {
        config.headers.Authorization = `Token ${token}`
    }
    return config
})

// Handle 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('creator_token')
            localStorage.removeItem('creator_user')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════
export const authApi = {
    register: (email, password, display_name) => api.post('/auth/register/', { email, password, display_name }),
    login: (email, password) => api.post('/auth/login/', { email, password }),
    me: () => api.get('/auth/me/'),
    logout: () => api.post('/auth/logout/'),
    updateProfile: (data) => api.put('/auth/profile/', data),
}

// ══════════════════════════════════════════════════════════
// CONTENT
// ══════════════════════════════════════════════════════════
export const contentApi = {
    list: (params) => api.get('/api/creator/content/', { params }),
    detail: (id) => api.get(`/api/creator/content/${id}/`),
    createDraft: (data) => api.post('/api/creator/content/draft/', data),
    // Alias for ContentUploadView compatibility
    create: (data) => api.post('/api/creator/content/draft/', data),
    update: (id, data) => api.put(`/api/creator/content/${id}/update/`, data),
    // S3 presigned URL endpoints
    uploadThumbnail: (id) => api.post(`/api/creator/content/${id}/upload-thumbnail/`),
    confirmThumbnail: (id, s3_key) => api.post(`/api/creator/content/${id}/confirm-thumbnail/`, { s3_key }),
    uploadMedia: (id, data) => api.post(`/api/creator/content/${id}/upload-media/`, data),
    confirmMedia: (id, data) => api.post(`/api/creator/content/${id}/confirm-media/`, data),
    transcode: (id) => api.post(`/api/creator/content/${id}/transcode/`),
    publish: (id) => api.post(`/api/creator/content/${id}/publish/`),
    unpublish: (id) => api.post(`/api/creator/content/${id}/unpublish/`),
    archive: (id) => api.delete(`/api/creator/content/${id}/archive/`),
    // High-level upload helpers (get presigned URL → upload to S3 → confirm)
    async uploadVideo(id, file) {
        const { data: urlData } = await api.post(`/api/creator/content/${id}/upload-media/`, { filename: file.name })
        if (urlData.upload_url) {
            await fetch(urlData.upload_url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } })
            await api.post(`/api/creator/content/${id}/confirm-media/`, { s3_key: urlData.s3_key, duration_seconds: null })
        }
        return urlData
    },
    async uploadThumbnailFile(id, file) {
        const { data: urlData } = await api.post(`/api/creator/content/${id}/upload-thumbnail/`)
        if (urlData.upload_url) {
            await fetch(urlData.upload_url, { method: 'PUT', body: file, headers: { 'Content-Type': 'image/jpeg' } })
            await api.post(`/api/creator/content/${id}/confirm-thumbnail/`, { s3_key: urlData.s3_key })
        }
        return urlData
    },
}

// ══════════════════════════════════════════════════════════
// EXPERTS
// ══════════════════════════════════════════════════════════
export const expertApi = {
    list: (params) => api.get('/api/creator/experts/', { params }),
    detail: (id) => api.get(`/api/creator/experts/${id}/`),
    create: (data) => api.post('/api/creator/experts/create/', data),
    update: (id, data) => api.put(`/api/creator/experts/${id}/update/`, data),
    deactivate: (id) => api.delete(`/api/creator/experts/${id}/deactivate/`),
}

// ══════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════
export const categoryApi = {
    list: () => api.get('/api/creator/categories/'),
    create: (data) => api.post('/api/creator/categories/create/', data),
    update: (id, data) => api.put(`/api/creator/categories/${id}/update/`, data),
}

// ══════════════════════════════════════════════════════════
// SERIES
// ══════════════════════════════════════════════════════════
export const seriesApi = {
    list: (params) => api.get('/api/creator/series/', { params }),
    detail: (id) => api.get(`/api/creator/series/${id}/`),
    create: (data) => api.post('/api/creator/series/create/', data),
    update: (id, data) => api.put(`/api/creator/series/${id}/update/`, data),
    addEpisode: (id, data) => api.post(`/api/creator/series/${id}/episodes/`, data),
    removeEpisode: (id, cid) => api.delete(`/api/creator/series/${id}/episodes/${cid}/`),
    reorderEpisodes: (id, episode_ids) => api.put(`/api/creator/series/${id}/episodes/reorder/`, { episode_ids }),
    publish: (id) => api.post(`/api/creator/series/${id}/publish/`),
    unpublish: (id) => api.post(`/api/creator/series/${id}/unpublish/`),
}

// ══════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════
export const dashboardApi = {
    stats: () => api.get('/api/creator/dashboard/'),
}

// ══════════════════════════════════════════════════════════
// EARNINGS / STRIPE CONNECT
// ══════════════════════════════════════════════════════════
export const earningsApi = {
    getEarnings: () => api.get('/api/creator/earnings/'),
    connectStripe: () => api.post('/api/creator/stripe/connect/'),
    getStripeStatus: () => api.get('/api/creator/stripe/status/'),
}

export default api
