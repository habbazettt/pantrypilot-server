# PantryPilot Server

Backend API untuk PantryPilot - aplikasi generator resep berbasis bahan makanan yang tersedia.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **Cache**: Redis Stack
- **ORM**: TypeORM (coming soon)
- **Documentation**: Swagger/OpenAPI

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run start:dev
```

Server berjalan di `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Hello World (test) |
| GET | `/health` | Health check (coming soon) |

## Project Structure

```
src/
├── modules/          # Feature modules
│   ├── recipe/       # Recipe generation & management
│   ├── cache/        # Redis caching logic
│   ├── user/         # User session handling
│   └── feedback/     # Recipe feedback system
├── common/           # Shared utilities
│   ├── dto/          # Data Transfer Objects
│   ├── filters/      # Exception filters
│   ├── guards/       # Auth guards
│   └── interceptors/ # Request/Response interceptors
├── config/           # Configuration files
└── main.ts           # Application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |

Lihat `.env.example` untuk daftar lengkap.

## Scripts

```bash
npm run start         # Production mode
npm run start:dev     # Development mode (watch)
npm run start:debug   # Debug mode
npm run build         # Build for production
npm run test          # Run unit tests
npm run test:e2e      # Run e2e tests
```

## Testing with Postman

1. Jalankan server: `npm run start:dev`
2. Buka Postman
3. Test endpoint:
   - **GET** `http://localhost:3000/` → Response: `Hello World!`

## Development Roadmap

Lihat [roadmap.md](./roadmap.md) untuk detail fase pengembangan.

---

*Part of [PantryPilot](../README.md) project*
