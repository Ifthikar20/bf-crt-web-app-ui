# 🎬 BetterFeel Creator Studio — How It Works

> This is the web app where **instructors and fitness coaches** create and publish content 
> (videos, audio, articles) that appears on the BetterFeel mobile app after admin approval.

---

## 🏠 The Big Picture

```
Instructor logs in → Dashboard → Creates content → Uploads video → Admin approves → Goes live on the app
```

Think of it like **YouTube Studio** but for wellness content.

---

## 🚶 Step-by-Step User Flow

### Step 1 — Login Page (`/login`)

> **What you see:** A dark card with email + password fields and a purple "Sign In" button.
>
> **What you do:** Enter your instructor credentials and click Sign In.

The app uses the **same login system** as the mobile app (DRF Token auth).

---

### Step 2 — Dashboard (`/`)

> **What you see after login:**
> - **4 stat cards** at the top: Total Content, Published, Pending Review, Total Views
> - **Recent Content table** showing your latest uploads with status badges
> - A purple **"+ New Content"** button in the top right

> **Where you click:** 
> - Click **"+ New Content"** to upload something new
> - Click **"View All →"** to see all your content
> - Click any item from the **sidebar** on the left

---

### Step 3 — Sidebar Navigation (always visible)

The left sidebar has 5 sections:

| Icon | Page | What it does |
|------|------|-------------|
| 📊 | **Dashboard** | Stats overview |
| 🎬 | **Content** | Manage all videos/audio/articles |
| 👤 | **Experts** | Add/edit instructor profiles |
| 📁 | **Categories** | Create content categories (Yoga, HIIT, etc.) |
| 📚 | **Series** | Group content into programs/playlists |

---

### Step 4 — Content Manager (`/content`)

> **What you see:** A filterable table of ALL your content.
>
> **Features:**
> - 🔍 **Search bar** — find content by title
> - **Status filter** dropdown — Draft, Pending Review, Published, Archived
> - **Type filter** dropdown — Video, Audio, Article
> - Each row shows: Title, Type, Category, Expert, Status (colored badge), Views, Last Updated
>
> **Actions per row:**
> - ✏️ **Edit** — go to the metadata editor
> - ▶️ **Publish** — make it live (only for drafts)
> - ⏸️ **Unpublish** — take it offline
> - 🗑️ **Archive** — soft delete

---

### Step 5 — Upload Wizard (`/content/new`) ⭐ The Main Feature

This is a **5-step wizard** with a progress bar at the top:

```
[1. Create Draft] → [2. Thumbnail] → [3. Media File] → [4. Metadata] → [5. Publish]
```

**Step 1 — Create Draft:**
- Enter a title (e.g. "Morning Yoga Flow")
- Pick type: Video, Audio, or Article
- Click "Create Draft →"

**Step 2 — Upload Thumbnail:**
- Click the upload zone (drag-and-drop style)
- Pick a JPG/PNG image
- Progress bar shows upload to S3
- Can skip this step

**Step 3 — Upload Media:**
- Click the upload zone
- Pick your video (MP4/MOV) or audio (MP3/WAV) file
- Progress bar shows direct upload to S3 (no server relay — fast!)
- Can skip this step

**Step 4 — Metadata:**
- Edit title and description
- Pick a **Category** (from dropdown — Yoga, Meditation, HIIT, etc.)
- Pick an **Expert/Instructor** (from dropdown)
- Add tags (comma separated)
- Toggle **Premium content** checkbox
- Click "Save & Continue →"

**Step 5 — Publish:**
- Big 🎉 celebration screen
- Click **"🚀 Publish Now"** to make it live
- Or click **"Save as Draft"** to publish later

---

### Step 6 — Experts Page (`/experts`)

> **What you see:** A table of all instructor profiles.
>
> **What you do:**
> - Click **"+ Add Expert"** → modal pops up
> - Fill in: Name, Title (e.g. "Yoga Instructor"), Bio, Featured checkbox
> - Click **Create**
> - To edit: click **✏️ Edit** on any row
> - To remove: click **🗑️** (soft-deletes, doesn't erase data)

---

### Step 7 — Categories Page (`/categories`)

> **What you see:** A grid of cards, one per category.
>
> **What you do:**
> - Click **"+ Add Category"** → modal pops up
> - Fill in: Name, Description, Sort Order
> - Click anywhere on a card to **edit** it

---

### Step 8 — Series Page (`/series`)

> **What you see:** A grid of series/program cards with episode counts.
>
> **What you do:**
> - Click **"+ New Series"** → enter title + description
> - Click on a series card → opens **detail modal** showing all episodes
> - Click **"+ Add Episode"** → pick from existing content → assigns episode number
> - Click **✕** on an episode to remove it
> - Click **▶️ Publish** or **⏸️ Unpublish** on the card

---

## 🎨 Design

- **Dark theme** — deep purple/black background
- **Glassmorphic cards** — semi-transparent with soft borders
- **Purple/indigo accents** — buttons, active states, glows
- **Inter font** — clean, modern typography
- **Responsive** — works on desktop and tablet

---

## 🔗 How It Connects

```
┌─────────────────────┐        API calls         ┌──────────────────────┐
│  Vue.js Frontend    │  ──────────────────────→  │  Django Backend      │
│  localhost:5173     │                            │  api.betterandbliss  │
│                     │  ← Token auth + JSON ──   │  /api/creator/*      │
└─────────────────────┘                            └──────────────────────┘
                                                            │
                                                            ▼
                                                   ┌──────────────┐
                                                   │  PostgreSQL  │
                                                   │  + AWS S3    │
                                                   └──────────────┘
```

Files are uploaded **directly to S3** using presigned URLs — the backend just generates the upload link, the frontend uploads the file straight to AWS. This is fast and doesn't overload the server.
