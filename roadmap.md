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

## 🔧 Phase 2: Rating & Feedback System

**Priority:** High | **Effort:** Medium

### Backend Tasks

- [ ] Extend existing `Feedback` entity untuk rating (1-5 stars)
- [ ] Create endpoint `POST /recipes/:id/rate` untuk submit rating
- [ ] Create endpoint `GET /recipes/:id/reviews` untuk get all reviews
- [ ] Implement average rating calculation di `RecipeRepository`
- [ ] Add `reviewCount` dan `averageRating` ke `RecipeResponseDto`

### Frontend Tasks

- [ ] Star rating component di RecipeCard
- [ ] Rating modal after viewing recipe
- [ ] Display average rating + total reviews
- [ ] Sort recipes by rating option

---

## 🔍 Phase 3: Search & Filter Enhancement

**Priority:** High | **Effort:** Low-Medium

### Backend Tasks

- [ ] Create `GET /recipes/search` endpoint with query params
- [ ] Implement full-text search PostgreSQL (`tsvector`)
- [ ] Add filter parameters: `difficulty`, `maxTime`, `tags`
- [ ] Pagination support (`limit`, `offset`)
- [ ] Sort options: `createdAt`, `rating`, `estimatedTime`

### Frontend Tasks

- [ ] Search bar di My Cookbook
- [ ] Filter chips (Quick filters)
- [ ] Sort dropdown
- [ ] Infinite scroll / Load more

---

## 🛒 Phase 4: Shopping List Generator

**Priority:** High | **Effort:** Medium

### Backend Tasks

- [ ] Create `ShoppingList` entity

  ```typescript
  interface ShoppingList {
    id: string;
    sessionId: string;
    items: ShoppingItem[];
    createdAt: Date;
  }
  
  interface ShoppingItem {
    ingredient: string;
    quantity?: string;
    recipeIds: string[]; // sources
    checked: boolean;
  }
  ```

- [ ] Create `POST /shopping-list/generate` - dari array of recipe IDs
- [ ] Implement ingredient deduplication & merge logic
- [ ] Create `GET /shopping-list` - get current list
- [ ] Create `PATCH /shopping-list/:itemId` - toggle checked
- [ ] Create `DELETE /shopping-list` - clear list

### Frontend Tasks

- [ ] "Add to Shopping List" button di RecipeCard
- [ ] Shopping List view/page
- [ ] Checkbox untuk mark items as bought
- [ ] Share/Export shopping list

---

## 🏷️ Phase 5: Custom Tags & Collections

**Priority:** Medium | **Effort:** Medium

### Backend Tasks

- [ ] Create `Collection` entity

  ```typescript
  interface Collection {
    id: string;
    sessionId: string;
    name: string;
    icon?: string;
    recipeIds: string[];
    createdAt: Date;
  }
  ```

- [ ] Create CRUD endpoints for collections
  - `POST /collections` - create collection
  - `GET /collections` - list user collections
  - `POST /collections/:id/recipes` - add recipe to collection
  - `DELETE /collections/:id/recipes/:recipeId` - remove recipe
- [ ] Update `RecipeResponseDto` to include `collections[]`

### Frontend Tasks

- [ ] Collection management UI
- [ ] Drag & drop recipes into collections
- [ ] Collection icons/colors picker
- [ ] Default collections: "Favorites", "To Try", "Weeknight Dinners"

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
