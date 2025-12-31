# PantryPilot - Development Roadmap 🚀

## Overview

Roadmap pengembangan fitur untuk PantryPilot, dimulai dari Backend (NestJS) lalu dilanjutkan ke Frontend (React/Vite).

---

## ✅ Phase 1: Core Features (COMPLETED)

- [x] Recipe Generation dengan Gemini AI
- [x] Advanced Search Filters (allergies, preferences, maxTime, difficulty)
- [x] Save/Unsave Recipes dengan Session Persistence
- [x] Smart Alternatives berdasarkan ingredient matching
- [x] Recipe Detail dengan step-by-step instructions
- [x] Allergen Detection & Filtering
- [x] Dietary Compliance Checking
- [x] Safety Notes Auto-Generation
- [x] Recipe Embedding untuk similarity search

---

## ✅ Phase 2: Rating & Feedback System (COMPLETED)

**Priority:** High | **Effort:** Medium

### Backend Tasks

- [x] Extend existing `Feedback` entity untuk rating (1-5 stars) + userId
- [x] Create endpoint `POST /recipes/:id/feedback` untuk submit rating (JWT protected)
- [x] Create endpoint `GET /recipes/:id/feedback` untuk get aggregated feedback
- [x] Implement average rating calculation di `FeedbackRepository`
- [x] Add `reviewCount` ke `RecipeResponseDto`

### Frontend Tasks

- [x] Star rating component di RecipeCard
- [x] Rating modal after viewing recipe
- [x] Display average rating + total reviews
- [x] Sort recipes by rating option

---

## 🔍 Phase 3: Search & Filter Enhancement

**Priority:** High | **Effort:** Low-Medium

### Backend Tasks

- [x] Create `GET /recipes/search` endpoint with query params
- [x] Implement full-text search PostgreSQL (`tsvector`)
- [x] Add filter parameters: `difficulty`, `maxTime`, `tags`
- [x] Pagination support (`limit`, `offset`)
- [x] Sort options: `createdAt`, `rating`, `estimatedTime`

### Frontend Tasks

- [x] Search bar di My Cookbook
- [x] Filter chips (Quick filters)
- [x] Sort dropdown
- [x] Infinite scroll / Load more

---

## 🌍 Phase 4: Cuisine by Country Preferences

**Priority:** High | **Effort:** Medium

### Backend Tasks

- [x] Create `Cuisine` enum/constant with popular cuisines:

  ```typescript
  enum Cuisine {
    INDONESIAN = 'indonesian',
    JAPANESE = 'japanese',
    KOREAN = 'korean',
    CHINESE = 'chinese',
    THAI = 'thai',
    INDIAN = 'indian',
    ITALIAN = 'italian',
    MEXICAN = 'mexican',
    AMERICAN = 'american',
    FRENCH = 'french',
    MIDDLE_EASTERN = 'middle_eastern',
  }
  ```

- [x] Update `GenerateRecipeDto` to include `cuisine?: string`
- [x] Modify Gemini prompt to incorporate cuisine preference
- [x] Add `cuisine` field to `Recipe` entity
- [x] Create `GET /cuisines` endpoint to list available cuisines

### Frontend Tasks

- [x] Cuisine selector dropdown/chips di Recipe Configuration
- [x] Display cuisine badge on RecipeCard
- [x] Filter by cuisine in My Cookbook
- [x] Popular cuisines quick-select buttons

---

## 📤 Phase 4: Social Sharing

**Priority:** Low | **Effort:** Medium

### Backend Tasks

- [x] Create `GET /recipes/:id/share` - generate shareable link
- [x] Create `GET /recipes/shared/:shareId` - public recipe view
- [x] Generate OG image dynamically (Canvas/Sharp)
- [x] Rate limiting untuk share generation

### Frontend Tasks

- [ ] Share button di RecipeCard
- [ ] Share modal dengan options (Copy Link, WhatsApp, Twitter)
- [ ] Generate recipe card image for sharing
- [ ] Public recipe view page (no auth required)

---

## 🎨 Phase 5: UI/UX Polish

**Priority:** Ongoing | **Effort:** Variable

### Tasks

- [ ] 3d background effect (e.g. Vanta.js etc)
- [ ] Smooth light/dark mode transitions
- [ ] Loading skeletons untuk semua async content
- [ ] Error boundaries & fallback UI
- [ ] Accessibility audit (a11y)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Onboarding tutorial untuk first-time users (How To Use dialog / page)
