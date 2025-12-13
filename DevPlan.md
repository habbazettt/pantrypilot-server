
# PantryPilot — High-Level Feature List + Development Plan

*(Frontend: React + Vite | Backend: NestJS | Redis & PostgreSQL via Docker)*

---

# 1. Business/User-Facing Features (apa yang dilihat pengguna)

## 1.1 Ingredient-to-Recipe Generator

Pengguna memasukkan bahan di rumah → sistem menghasilkan 1–3 resep yang relevan, praktis, dan mudah diikuti.
Manfaat: mempermudah memasak tanpa harus mencari resep satu per satu.

## 1.2 Smart Caching (Respon Cepat)

Jika memasukkan kombinasi bahan yang sama, hasil muncul jauh lebih cepat karena sistem menyimpan hasil sebelumnya.
Manfaat: pengalaman cepat & responsif.

## 1.3 Recipe Detail Viewer

Tampilkan resep secara lengkap: bahan sederhana, langkah 3–6 poin, estimasi waktu, catatan aman.
Manfaat: pengguna langsung bisa memasak tanpa membuka halaman lain.

## 1.4 Save & Bookmark Recipes

Pengguna dapat menyimpan resep favorit dan membukanya kembali.
Manfaat: akses cepat ke resep favorit.

## 1.5 Alternative & Similar Recipe Suggestions

Sistem memberikan resep lain yang mirip atau dengan substitusi bahan.
Manfaat: fleksibilitas dan variasi masakan.

## 1.6 Recipe Feedback

Pengguna dapat memberi thumbs up/down untuk meningkatkan kualitas rekomendasi.
Manfaat: kualitas hasil membaik seiring feedback.

## 1.7 Anonymous Quick Use

Pengguna bisa mencoba tanpa login—cukup buka web dan mulai.
Manfaat: akses cepat, cocok untuk demo.

## 1.8 Safety & Dietary Checks

Resep otomatis disesuaikan dengan alergi atau preferensi diet.
Manfaat: lebih aman dan relevan untuk setiap user.

## 1.9 Simple, One-Page UI (React + Vite)

Antarmuka clean dan mudah dipahami oleh pengguna awam.
Manfaat: friksi rendah, sangat mudah digunakan.

## 1.10 Local Demo Mode via Docker

Seluruh sistem dapat berjalan lokal (Redis + PostgreSQL + Backend + Frontend).
Manfaat: cocok untuk showcase, presentasi offline, atau testing internal.

---

# 2. Technical-Facing Features (yang dibangun oleh tim dev)

## 2.1 Backend API (NestJS)

* Endpoint `generate`, `get recipe`, `save`, `similar`, `feedback`.
* Validasi input, error handling, safe defaults.
* Modular architecture: service, controller, provider.

## 2.2 Redis Stack (Docker)

* **Caching** untuk hasil generate.
* **Vector Index** untuk similarity search.
* **Streams** untuk job queue (opsional).
* Local-only environment for low-cost development.

## 2.3 PostgreSQL (Docker)

* Penyimpanan permanen: resep tersimpan, feedback, metadata.
* Struktur table sederhana: `recipes`, `saved_recipes`, `feedback`, `users` (optional).
* Database lokal cepat, cocok untuk demo offline.

## 2.4 Embedding Engine

* Menghasilkan embedding bahan & resep untuk similarity.
* Model ringan agar cocok di local dev environment.

## 2.5 React + Vite Frontend

* One-page experience: input → generate → lihat → simpan → lihat alternatif.
* State management ringan (React Query / Zustand).
* Komponen: ingredient chips, recipe cards, feedback controls.

## 2.6 Dockerized Local Environment

Empat komponen dijalankan serentak via Docker Compose:

* Redis Stack
* PostgreSQL
* Backend API
* Frontend dev server

Ini memudahkan demo, QA, dan portabilitas.

---

# 3. High-Level Development Plan (combined for business + technical)

## Phase 0 — Alignment & Wireframing

Deliverables:

* Ringkas kebutuhan pengguna
* Wireframe single-page UI
* Use-case utama final (generate → save → similar)

Audience benefit: memastikan semua pihak memiliki gambaran yang sama.

---

## Phase 1 — Environment & Setup (Local Docker-first)

Deliverables:

* Repository proyek (frontend & backend)
* **Docker Compose** berisi: Redis Stack, PostgreSQL, Adminer/pgAdmin (optional)
* React + Vite bootstrap
* NestJS skeleton + health check endpoint

Benefit: seluruh stack berjalan seragam di semua laptop, tanpa setup manual.

---

## Phase 2 — Core Recipe Generation Flow

Deliverables:

* Endpoint `POST /recipes/generate`
* Fingerprinting input (hash)
* Redis cache-aside
* LLM integration (HuggingFace free-tier atau stub untuk local offline)
* Basic UI: input bahan dan hasil resep

Benefit: fitur inti sistem siap digunakan.

---

## Phase 3 — Persistence & Saved Recipes (PostgreSQL via Docker)

Deliverables:

* Schema PostgreSQL untuk recipes & saved_recipes
* Endpoint save & retrieve
* UI untuk melihat daftar resep tersimpan

Benefit: data tidak hilang, user dapat membangun koleksi mereka.

---

## Phase 4 — Similarity & Recommendations

Deliverables:

* Embedding generator
* Redis Vector Index setup
* Endpoint `similar`
* UI tombol “Alternative Recipe”

Benefit: menambah nilai unik PantryPilot dibanding sekedar generator.

---

## Phase 5 — Experience Improvements

Deliverables:

* Ingredient chips autocomplete
* Loader animasi & status
* Cache-hit indicator
* Safety & allergy filtering
* Feedback UI

Benefit: UX finetuned untuk demo publik / user awam.

---

## Phase 6 — Reliability & Demo-Readiness

Deliverables:

* Rate limit sederhana
* Error messaging yang rapi
* Worker optional untuk heavy jobs
* Performance testing (local)

Benefit: demo berjalan mulus tanpa error tiba-tiba.

---

## Phase 7 — Launch (Local or Hosted)

Deliverables:

* Docker-based demo script
* Optional: hosting backend → Railway/Render, frontend → Netlify/Vercel
* Dokumentasi 1 halaman (untuk user)
* Short video rundown (optional)

Benefit: siap dipresentasikan ke stakeholder atau publik.

---

# 4. Mapping: Business Features → Technical Work

| Business Feature    | Technical Implementation            |
| ------------------- | ----------------------------------- |
| Generate recipes    | LLM + NestJS endpoint + Redis cache |
| Fast experience     | Redis cache-aside + fingerprinting  |
| Save recipes        | PostgreSQL Docker + save endpoint   |
| Alternative recipes | Embeddings + Redis vector index     |
| Feedback            | Postgres table + endpoint           |
| Anonymous quick use | Lightweight session                 |
| Safety filtering    | Post-processing validator           |
| Polished UI         | React Vite SPA                      |
| Local demo          | Docker Compose orchestration        |

---

# 5. Summary (for Stakeholders)

PantryPilot memberikan pengalaman sederhana bagi pengguna: cukup masukkan bahan, dan aplikasi langsung menampilkan resep praktis. Dari sisi teknis, sistem dirancang modular dan sepenuhnya berjalan melalui Docker sehingga mudah dipamerkan dan dijalankan di mana saja tanpa biaya.
