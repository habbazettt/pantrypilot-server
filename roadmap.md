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
