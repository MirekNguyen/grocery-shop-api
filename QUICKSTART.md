# Quick Start Guide

## Option 1: Docker (Recommended - Easiest)

### 1. Start Services
```bash
docker compose up -d
```

This starts both PostgreSQL and Meilisearch.

### 2. Push Database Schema
```bash
# This creates tables directly without migration files
bun run db:push
```

### 3. Setup Meilisearch
```bash
bun run search:setup
```

### 4. Run Scraper
```bash
bun run dev
```

### 5. Index Products
```bash
bun run search:index
```

### 6. Start API
```bash
bun run api
```

### Stop Services
```bash
docker compose down
```

---

## Option 2: Install Locally (macOS)

### 1. Install PostgreSQL
```bash
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb shop_scraper
```

### 2. Install Meilisearch
```bash
brew install meilisearch

# Run in a separate terminal
meilisearch --master-key="masterKey"
```

### 3. Continue from step 2 above
```bash
bun run db:push
bun run search:setup
# ... etc
```

---

## Verify Setup

### Check PostgreSQL
```bash
# If using Docker
docker exec -it shop-postgres psql -U postgres -d shop_scraper -c "SELECT 1"

# If installed locally
psql postgres://postgres:postgres@localhost:5432/shop_scraper -c "SELECT 1"
```

### Check Meilisearch
```bash
curl http://localhost:7700/health
```

### View Database
```bash
bun run db:studio
```

---

## Troubleshooting

### PostgreSQL not connecting?
```bash
# Check if running (Docker)
docker ps | grep postgres

# Check if running (local)
brew services list | grep postgresql
```

### Meilisearch not responding?
```bash
# Check if running (Docker)
docker ps | grep meilisearch

# Check logs
docker logs shop-meilisearch
```

### Reset everything
```bash
# Stop and remove all data
docker compose down -v

# Start fresh
docker compose up -d
bun run db:push
```
