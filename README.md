# 🍳 PantryPilot Server

Backend API untuk PantryPilot - aplikasi AI-powered recipe generator berbasis bahan makanan yang tersedia.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## ✨ Features

- 🤖 **AI Recipe Generation** - Generate creative recipes using Google Gemini AI
- 🔍 **Similar Recipe Search** - Find similar recipes using embedding similarity
- 📑 **Alternative Suggestions** - Find recipes based on ingredients you have
- ⭐ **Feedback System** - Rate and review recipes with aggregation
- 🚫 **Allergy Filtering** - Comprehensive allergen database with auto-filtering
- 🥗 **Dietary Preferences** - Support for vegetarian, vegan, halal, gluten-free, etc.
- 🛡️ **Safety Notes** - Auto-generated cooking safety reminders
- 📊 **Prometheus Metrics** - Built-in monitoring and observability
- 🔐 **Anonymous Sessions** - Session management without authentication

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS** | Backend framework |
| **TypeScript** | Type-safe development |
| **PostgreSQL** | Primary database |
| **Redis** | Session storage & caching |
| **TypeORM** | Database ORM |
| **Google Gemini** | AI recipe generation & embeddings |
| **Swagger** | API documentation |
| **Docker** | Containerization |
| **Prometheus/Grafana** | Monitoring |

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd pantrypilot-server

# Copy environment file
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_api_key_here

# Start all services
docker-compose up -d --build

# View logs
docker logs -f pantrypilot-api
```

Server berjalan di `http://localhost:3000`

### Manual Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL & Redis (manually or via docker-compose)
docker-compose up -d postgres redis

# Run development server
npm run start:dev
```

## 📚 API Endpoints

### Recipes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recipes/generate` | Generate recipes from ingredients using AI |
| POST | `/api/recipes/save` | Bookmark a recipe |
| GET | `/api/recipes/saved` | Get saved recipes for current session |
| DELETE | `/api/recipes/saved/:id` | Remove bookmark |
| GET | `/api/recipes/alternatives` | Find recipes matching your ingredients |
| GET | `/api/recipes` | Get all recipes |
| GET | `/api/recipes/:id` | Get recipe by ID |
| GET | `/api/recipes/:id/similar` | Get similar recipes |
| POST | `/api/recipes/:id/feedback` | Submit rating/feedback |
| GET | `/api/recipes/:id/feedback` | Get aggregated feedback |

### Reference Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/allergens` | Get allergen database |
| GET | `/api/allergens/names` | Get all allergen names |
| GET | `/api/dietary` | Get dietary preferences |
| GET | `/api/dietary/names` | Get dietary preference names |

### Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/metrics` | Prometheus metrics |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/docs` | Swagger UI |

## 📂 Project Structure

```
src/
├── modules/
│   ├── recipe/        # Recipe generation & management
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── recipe.service.ts
│   │   │   └── gemini.service.ts
│   │   ├── repositories/
│   │   ├── entities/
│   │   └── dto/
│   ├── feedback/      # Rating & feedback system
│   ├── session/       # Anonymous session handling
│   ├── embedding/     # Vector embeddings for similarity
│   ├── allergen/      # Allergen database & filtering
│   ├── dietary/       # Dietary preferences
│   ├── safety/        # Safety notes generation
│   └── health/        # Health checks
├── common/
│   ├── middleware/    # Session middleware
│   ├── filters/       # Exception filters
│   └── interceptors/  # Metrics interceptor
├── config/            # Configuration files
└── main.ts            # Application entry
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `API_PREFIX` | API route prefix | `api` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USER` | Database user | `pantrypilot` |
| `DATABASE_PASSWORD` | Database password | `pantrypilot123` |
| `DATABASE_NAME` | Database name | `pantrypilot` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `LLM_PROVIDER` | AI provider | `gemini` |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.0-flash` |

Lihat `.env.example` untuk daftar lengkap.

## 🔧 Scripts

```bash
npm run start           # Production mode
npm run start:dev       # Development mode (watch)
npm run start:debug     # Debug mode
npm run build           # Build for production
npm run test            # Run unit tests
npm run test:e2e        # Run e2e tests
npm run lint            # Lint code
npm run format          # Format code
```

## 🧪 Testing with Postman

1. Import collection dari `postman/PantryPilot-API.postman_collection.json`
2. Set environment variable `baseUrl` = `http://localhost:3000/api`
3. Test endpoints:

**Generate Recipes:**

```json
POST /api/recipes/generate
{
  "ingredients": ["ayam", "bawang putih", "kecap manis"],
  "maxTime": 30,
  "difficulty": "easy",
  "allergies": ["kacang"],
  "preferences": ["halal"]
}
```

**Get Similar Recipes:**

```
GET /api/recipes/:id/similar
```

**Find Alternatives:**

```
GET /api/recipes/alternatives?ingredients=ayam,tempe&limit=5
```

## 📊 Monitoring

### Grafana Dashboard

- URL: `http://localhost:3001`
- Default credentials: `admin` / `admin`

### Prometheus

- URL: `http://localhost:9090`

### Adminer (Database UI)

- URL: `http://localhost:8080`
- System: PostgreSQL
- Server: `postgres`
- Username: `pantrypilot`
- Password: `pantrypilot123`

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client App    │────▶│  NestJS API     │────▶│   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               ▼                        │
                        ┌─────────────────┐             │
                        │   Google Gemini │             │
                        │   (AI/Embeddings)│            │
                        └─────────────────┘             │
                               │                        │
                               ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │     Redis       │     │   Prometheus    │
                        │   (Sessions)    │     │   (Metrics)     │
                        └─────────────────┘     └─────────────────┘
```

## 📝 Development Notes

### AI Recipe Generation Flow

1. Client sends ingredients + preferences
2. System generates fingerprint for caching
3. Check cache for existing recipes
4. If not cached, call Gemini AI
5. Post-process: allergen filtering, dietary tagging, safety notes
6. Generate embeddings for similarity search
7. Save to database and return

### Safety Notes Auto-Generation

- Detects ingredients with safety concerns (raw meat, seafood, etc.)
- Analyzes cooking steps for hazards (frying, steaming, etc.)
- Merges with AI-generated notes

### Dietary Preferences Supported

- `vegetarian` - No meat/seafood
- `vegan` - No animal products
- `halal` - No pork/alcohol
- `gluten-free` - No wheat/gluten
- `dairy-free` - No dairy products
- `low-carb` - Reduced carbohydrates

---

*Part of [PantryPilot](habbazahubbal@gmail.com) project*
