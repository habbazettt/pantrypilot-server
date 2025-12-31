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

- [ ] Create `Cuisine` enum/constant with popular cuisines:

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

- [ ] Update `GenerateRecipeDto` to include `cuisine?: string`
- [ ] Modify Gemini prompt to incorporate cuisine preference
- [ ] Add `cuisine` field to `Recipe` entity
- [ ] Create `GET /cuisines` endpoint to list available cuisines

### Frontend Tasks

- [ ] Cuisine selector dropdown/chips di Recipe Configuration
- [ ] Display cuisine badge on RecipeCard
- [ ] Filter by cuisine in My Cookbook
- [ ] Popular cuisines quick-select buttons

---

## 📊 Phase 6: Nutrition Estimator (AI)

**Priority:** Medium | **Effort:** High

### Backend Tasks

- [ ] Create `NutritionService` module
- [ ] Integrate dengan nutrition API (USDA / Nutritionix) atau Gemini estimation
- [ ] Create `GET /recipes/:id/nutrition` endpoint
- [ ] Response structure:

  ```typescript
  interface NutritionInfo {
    calories: number;
    protein: number;    // grams
    carbs: number;      // grams
    fat: number;        // grams
    fiber?: number;
    sodium?: number;
    servingSize: string;
    confidence: 'high' | 'medium' | 'low';
  }
  ```

- [ ] Cache nutrition data di Recipe entity

### Frontend Tasks

- [ ] Nutrition card di Recipe Detail
- [ ] Visual breakdown (pie chart / progress bars)
- [ ] Daily value percentage indicators
- [ ] Filter by calorie range

---

## 📱 Phase 7: PWA Support

**Priority:** Medium | **Effort:** Low

### Backend Tasks

- [ ] Implement proper cache headers
- [ ] Add `manifest.json` endpoint (or static serve)
- [ ] Service worker caching strategy recommendations

### Frontend Tasks

- [ ] Create `manifest.json` with app icons
- [ ] Implement Service Worker (Workbox)
- [ ] Offline-first for saved recipes
- [ ] Install prompt / Add to Home Screen
- [ ] Push notification setup (optional)

---

## 🗣️ Phase 8: Voice Input

**Priority:** Low | **Effort:** Low

### Backend Tasks

- [ ] No backend changes required (client-side feature)

### Frontend Tasks

- [ ] Integrate Web Speech API
- [ ] Voice button di TagInput component
- [ ] Visual feedback saat recording
- [ ] Auto-add recognized ingredients
- [ ] Language support: EN, ID

---

## 📤 Phase 9: Social Sharing

**Priority:** Low | **Effort:** Medium

### Backend Tasks

- [ ] Create `GET /recipes/:id/share` - generate shareable link
- [ ] Create `GET /recipes/shared/:shareId` - public recipe view
- [ ] Optional: Generate OG image dynamically (Canvas/Sharp)
- [ ] Rate limiting untuk share generation

### Frontend Tasks

- [ ] Share button di RecipeCard
- [ ] Share modal dengan options (Copy Link, WhatsApp, Twitter)
- [ ] Generate recipe card image for sharing
- [ ] Public recipe view page (no auth required)

---

## 🎨 Phase 10: UI/UX Polish (Ongoing)

**Priority:** Ongoing | **Effort:** Variable

### Tasks

- [ ] Smooth light/dark mode transitions
- [ ] Loading skeletons untuk semua async content
- [ ] Error boundaries & fallback UI
- [ ] Accessibility audit (a11y)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Mobile gesture support (swipe to save, pull to refresh)
- [ ] Onboarding tutorial untuk first-time users

---

## 📈 Tech Debt & Infrastructure

### Backend

- [ ] Add comprehensive unit tests
- [ ] Add integration tests dengan TestContainers
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Database migrations setup (TypeORM migrations)
- [ ] Logging enhancement (structured logs)
- [ ] Health check endpoints enrichment
