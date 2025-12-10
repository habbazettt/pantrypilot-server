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

- [ ] Install dan konfigurasi TypeORM/Prisma
- [ ] Setup database connection dengan PostgreSQL
- [ ] Buat initial migration setup
- [ ] Konfigurasi Redis client (`ioredis` atau `@nestjs-modules/ioredis`)

### 1.4 Base Configuration

- [ ] Setup ConfigModule dengan validation (Joi/class-validator)
- [ ] Konfigurasi CORS
- [ ] Setup global exception filter
- [ ] Setup request logging interceptor
- [ ] Health check endpoint (`GET /health`)

### 1.5 Swagger API Documentation

- [ ] Install `@nestjs/swagger` dan `swagger-ui-express`
- [ ] Setup Swagger module di `main.ts`
- [ ] Konfigurasi API metadata (title, description, version)
- [ ] Endpoint `/api/docs` untuk Swagger UI
- [ ] Gunakan decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) di setiap endpoint

### 1.6 Prometheus & Grafana Monitoring

- [ ] Install `@willsoto/nestjs-prometheus` dan `prom-client`
- [ ] Setup PrometheusModule di `app.module.ts`
- [ ] Endpoint `/metrics` untuk Prometheus scraping
- [ ] Tambahkan Prometheus & Grafana ke `docker-compose.yml`
- [ ] Buat Grafana dashboard untuk API metrics (request rate, latency, errors)

**Deliverables**:

- ✅ NestJS project running di Docker
- ✅ PostgreSQL & Redis connected
- ✅ Health check endpoint berfungsi

---

## 🗓️ Phase 2 — Core Recipe Generation

### 2.1 Recipe Module Setup

- [ ] Buat Recipe module (`nest g module recipe`)
- [ ] Buat entities:

### 2.2 LLM Integration

- [ ] Buat LLM provider service (abstract untuk flexibility)
- [ ] Integrasi HuggingFace Inference API (free tier)
- [ ] Buat fallback/stub untuk offline mode
- [ ] Design prompt template untuk recipe generation
- [ ] Implement response parsing & validation

### 2.3 Generate Endpoint

- [ ] `POST /recipes/generate`
- [ ] Input validation dengan class-validator
- [ ] Safe defaults untuk optional fields

### 2.4 Cache Implementation (Redis)

- [ ] Implement input fingerprinting (hash dari ingredients + preferences)
- [ ] Cache-aside pattern:
  1. Check Redis cache dengan fingerprint
  2. Jika hit → return cached result
  3. Jika miss → generate → store → return
- [ ] TTL configuration (misal 24 jam)
- [ ] Cache invalidation strategy

**Deliverables**:

- ✅ Generate endpoint berfungsi
- ✅ LLM integration working (atau stub)
- ✅ Redis caching aktif
- ✅ Response dalam format JSON terstruktur

---

## 🗓️ Phase 3 — Persistence & Saved Recipes

### 3.1 Database Schema

- [ ] Buat migrations untuk tables:

### 3.2 Recipe Persistence Endpoints

- [ ] `POST /recipes/save` — Simpan resep
- [ ] `GET /recipes/saved` — List resep tersimpan
- [ ] `DELETE /recipes/saved/:id` — Hapus bookmark
- [ ] `GET /recipes/:id` — Get single recipe detail

### 3.3 Anonymous Session Handling

- [ ] Implement session token generation
- [ ] Store session di Redis (short-lived)
- [ ] Link saved recipes ke session ID

**Deliverables**:

- ✅ CRUD untuk saved recipes
- ✅ Anonymous user dapat save & retrieve
- ✅ Data persisten di PostgreSQL

---

## 🗓️ Phase 4 — Similarity & Recommendations

### 4.1 Embedding Generation

- [ ] Pilih embedding model (sentence-transformers/all-MiniLM-L6-v2)
- [ ] Buat embedding service
- [ ] Generate embeddings untuk setiap recipe baru
- [ ] Store embeddings (di PostgreSQL atau Redis)

### 4.2 Redis Vector Index

- [ ] Setup Redis Search module
- [ ] Create vector index untuk recipe embeddings
- [ ] Implement similarity search function (KNN)

### 4.3 Similar Recipe Endpoint

- [ ] `GET /recipes/:id/similar`
- [ ] Limit jumlah hasil (top 3-5)
- [ ] Exclude recipe yang sama dari hasil

### 4.4 Alternative Suggestions

- [ ] `GET /recipes/alternatives?ingredients=...`
- [ ] Suggest recipes dengan substitusi bahan
- [ ] Consider allergy/dietary filters

**Deliverables**:

- ✅ Embedding generation otomatis
- ✅ Similar recipes endpoint
- ✅ Vector search via Redis

---

## 🗓️ Phase 5 — Feedback System

### 5.1 Feedback Schema

- [ ] Buat feedback table:

### 5.2 Feedback Endpoints

- [ ] `POST /recipes/:id/feedback`
- [ ] `GET /recipes/:id/feedback` — Get aggregated feedback
- [ ] Rate limiting untuk mencegah spam

### 5.3 Feedback Analytics (Optional)

- [ ] Aggregate rating per recipe
- [ ] Use feedback untuk improve recommendations

**Deliverables**:

- ✅ Feedback submission working
- ✅ Rating aggregation

---

## 🗓️ Phase 6 — Safety & Filtering

### 6.1 Allergy Filtering

- [ ] Define common allergens list
- [ ] Post-processing filter untuk LLM output
- [ ] Validate ingredients terhadap allergen database

### 6.2 Dietary Preferences

- [ ] Support filters: vegetarian, vegan, halal, gluten-free
- [ ] Inject preferences ke LLM prompt
- [ ] Tag recipes dengan dietary info

### 6.3 Safety Notes

- [ ] Auto-generate cooking safety reminders
- [ ] Ingredient-specific warnings (raw meat, shellfish, dll)

**Deliverables**:

- ✅ Allergy-safe recipes
- ✅ Dietary filters working

---

## 🗓️ Phase 7 — Reliability & Performance

### 7.1 Rate Limiting

- [ ] Implement rate limiter (nestjs-rate-limiter)
- [ ] Konfigurasi per endpoint
- [ ] Custom responses untuk rate limited requests

### 7.2 Error Handling

- [ ] Global exception filter
- [ ] Standardized error response format
- [ ] User-friendly error messages

### 7.3 Logging & Monitoring

- [ ] Structured logging (Winston/Pino)
- [ ] Request/Response logging
- [ ] Error tracking setup

### 7.4 Performance Optimization

- [ ] Database query optimization
- [ ] Connection pooling
- [ ] Response compression

**Deliverables**:

- ✅ Rate limiting aktif
- ✅ Clean error responses
- ✅ Logging infrastructure

---

## 🗓️ Phase 8 — Documentation & Demo Ready

### 8.1 API Documentation

- [ ] Setup Swagger/OpenAPI (`@nestjs/swagger`)
- [ ] Document semua endpoints
- [ ] Add request/response examples

### 8.2 Demo Script

- [ ] Buat demo seed data
- [ ] Script untuk populate sample recipes
- [ ] One-command startup script

### 8.3 README & Setup Guide

- [ ] Comprehensive README.md
- [ ] Quick start guide
- [ ] Environment variables documentation

**Deliverables**:

- ✅ Swagger UI accessible
- ✅ Demo dapat dijalankan dengan 1 command
- ✅ Dokumentasi lengkap

---

## 🎯 Minimum Viable Product (MVP)

1. ✅ Backend running di Docker
2. ✅ Generate recipe dari ingredients
3. ✅ Redis caching untuk response cepat
4. ✅ Save & retrieve resep favorit
