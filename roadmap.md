# PantryPilot Backend Roadmap

> **Stack**: NestJS + PostgreSQL + Redis Stack  
> **Environment**: Docker-first local development

---

## 📋 Overview

Roadmap ini menjabarkan langkah-langkah teknis untuk membangun **pantrypilot-server**, backend API yang mendukung fitur utama PantryPilot: generate resep dari bahan, caching cepat, simpan resep favorit, similarity search, dan feedback system.

---

## 🗓️ Phase 1 — Project Setup & Environment

### 1.1 Initialize NestJS Project

- [x] Inisialisasi project dengan `nest new pantrypilot-server`
- [x] Setup struktur folder modular
- [x] Konfigurasi environment variables (`.env`, `.env.example`)

### 1.2 Docker Compose Setup

- [x] Buat `docker-compose.yml` dengan services:
  - PostgreSQL
  - Redis Stack
  - Adminer
- [x] Buat `Dockerfile` untuk backend
- [x] Setup volume untuk persistent data

### 1.3 Database & ORM Configuration

- [x] Install dan konfigurasi TypeORM/Prisma
- [x] Setup database connection dengan PostgreSQL
- [x] Buat initial migration setup
- [x] Konfigurasi Redis client (`ioredis` atau `@nestjs-modules/ioredis`)

### 1.4 Base Configuration

- [x] Setup ConfigModule dengan validation (Joi/class-validator)
- [x] Konfigurasi CORS
- [x] Setup global exception filter
- [x] Setup request logging interceptor
- [x] Health check endpoint (`GET /health`)

### 1.5 Swagger API Documentation

- [x] Install `@nestjs/swagger` dan `swagger-ui-express`
- [x] Setup Swagger module di `main.ts`
- [x] Konfigurasi API metadata (title, description, version)
- [x] Endpoint `/api/docs` untuk Swagger UI
- [x] Gunakan decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) di setiap endpoint

### 1.6 Prometheus & Grafana Monitoring

- [x] Install `@willsoto/nestjs-prometheus` dan `prom-client`
- [x] Setup PrometheusModule di `app.module.ts`
- [x] Endpoint `/metrics` untuk Prometheus scraping
- [x] Tambahkan Prometheus & Grafana ke `docker-compose.yml`
- [x] Buat Grafana dashboard untuk API metrics (request rate, latency, errors)

### 1.7 Setup End-to-End Testing

- [ ] Install `@nestjs/testing`, `jest`, dan `ts-jest`
- [ ] Setup jest.config.js
- [ ] Buat test cases untuk setiap service
- [ ] Setup coverage reporting

---

## 🗓️ Phase 2 — Core Recipe Generation

### 2.1 Recipe Module Setup

- [x] Buat Recipe module (`nest g module recipe`)
- [x] Buat entities
- [x] Buat repositories
- [x] Buat services

### 2.2 LLM Integration

- [x] Implementasi GeminiService
- [x] Implementasi fallback/stub untuk offline mode
- [x] Design prompt template untuk recipe generation
- [x] Implementasi response parsing & validation
- [x] Implementasi retry mechanism

### 2.3 Generate Endpoint

- [x] `POST /recipes/generate`
- [x] Input validation dengan class-validator
- [x] Safe defaults untuk optional fields

---

## 🗓️ Phase 3 — Persistence & Saved Recipes

### 3.1 Database Schema

- [x] Buat migrations untuk tables

### 3.2 Recipe Persistence Endpoints

- [x] `POST /recipes/save` — Simpan resep
- [x] `GET /recipes/saved` — List resep tersimpan
- [x] `DELETE /recipes/saved/:id` — Hapus bookmark
- [x] `GET /recipes/:id` — Get single recipe detail

### 3.3 Anonymous Session Handling

- [x] Implement session token generation
- [x] Store session di Redis (short-lived)
- [x] Link saved recipes ke session ID

---

## 🗓️ Phase 4 — Similarity & Recommendations

### 4.1 Embedding Generation

- [x] Pilih embedding model (sentence-transformers/all-MiniLM-L6-v2)
- [x] Buat embedding service
- [x] Generate embeddings untuk setiap recipe baru
- [x] Store embeddings (di PostgreSQL atau Redis)

### 4.2 Similar Recipe Endpoint

- [x] `GET /recipes/:id/similar`
- [x] Limit jumlah hasil (top 3-5)
- [x] Exclude recipe yang sama dari hasil

### 4.3 Alternative Suggestions

- [x] `GET /recipes/alternatives?ingredients=...`
- [x] Suggest recipes dengan substitusi bahan
- [x] Consider allergy/dietary filters

---

## 🗓️ Phase 5 — Feedback System

### 5.1 Feedback Schema

- [x] Buat feedback table:

### 5.2 Feedback Endpoints

- [x] `POST /recipes/:id/feedback`
- [x] `GET /recipes/:id/feedback` — Get aggregated feedback
- [x] Rate limiting untuk mencegah spam

### 5.3 Feedback Analytics (Optional)

- [x] Aggregate rating per recipe
- [x] Use feedback untuk improve recommendations

---

## 🗓️ Phase 6 — Safety & Filtering

### 6.1 Allergy Filtering

- [x] Define common allergens list
- [x] Post-processing filter untuk LLM output
- [x] Validate ingredients terhadap allergen database

### 6.2 Dietary Preferences

- [x] Support filters: vegetarian, vegan, halal, gluten-free
- [x] Inject preferences ke LLM prompt
- [x] Tag recipes dengan dietary info

### 6.3 Safety Notes

- [x] Auto-generate cooking safety reminders
- [x] Ingredient-specific warnings (raw meat, shellfish, dll)
