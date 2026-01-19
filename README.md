# Shop Scraper

A Bun-based web scraper for Billa and Foodora products with database storage and search capabilities.

## Projects

This repository contains **two separate scrapers**:

### 1. Billa Scraper
- PostgreSQL database with Drizzle ORM
- Meilisearch integration
- RESTful API
- See below for details

### 2. Foodora Scraper (GraphQL)
- Modular TypeScript architecture
- Zod validation
- Category-based scraping
- **📖 [Full Documentation](./docs/FOODORA-README.md)**

---

## Billa Scraper

A Bun-based web scraper for Billa shop products using **PostgreSQL**, **Drizzle ORM**, and **Meilisearch**.

## Tech Stack

- **Runtime:** Bun
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Search:** Meilisearch
- **Language:** TypeScript (Strict Mode)

## Features

- ✅ Scrapes all categories from Billa shop API
- ✅ Handles pagination automatically
- ✅ **Many-to-many relationship: Products can belong to multiple categories**
- ✅ **Auto-discovers and saves new categories from API**
- ✅ Stores products in PostgreSQL database with proper relationships
- ✅ **Advanced search with Meilisearch** (typo tolerance, multi-language support)
- ✅ Supports running multiple times (upserts existing products)
- ✅ Type-safe with TypeScript
- ✅ Clean Architecture with Repository Pattern
- ✅ **Query products by category using database joins**
- ✅ **RESTful API** with filtering, search, and pagination

## Prerequisites

- Bun (latest version)
- PostgreSQL 16+
- Meilisearch 1.6+

## Quick Start

### 1. Install Services

**PostgreSQL:**
```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Or Docker
docker run -d --name shop-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shop_scraper \
  -p 5432:5432 postgres:16-alpine
```

**Meilisearch:**
```bash
# macOS
brew install meilisearch
meilisearch --master-key="your_key_here"

# Or Docker
docker run -d --name shop-meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY="your_key_here" \
  getmeili/meilisearch:v1.6
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database and Meilisearch credentials
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Setup Database

```bash
# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate
```

### 5. Setup Search

```bash
# Initialize Meilisearch indexes
bun run search:setup
```

### 6. Run Scraper

```bash
bun run dev
```

### 7. Index Products for Search

```bash
bun run search:index
```

### 8. Start API Server

```bash
bun run api
```

## Database Schema

**Categories Table:**
- id (serial), key, name, slug, orderHint
- Timestamps (createdAt, updatedAt)

**Products Table:**
- Product identifiers (productId, sku, slug)
- Names and descriptions
- Category information (category, categorySlug - for reference)
- Brand details
- Pricing (normal, sale, unit prices)
- Images (JSON array)
- Weight and packaging info
- Marketing information
- Timestamps

**Product-Categories Junction Table (Many-to-Many):**
- product_id, category_id (composite primary key)
- Enables products to belong to multiple categories
- Example: A bagel can be in both "Pečivo" and "Bagety a veky"

**Relationships:**
- Products ↔ Categories: Many-to-Many via `product_categories`
- Categories are auto-discovered from API's `parentCategories` field
- Each product is linked to all its parent categories

## Database Management

View database statistics:
```bash
bun run db:stats
```

Query products by category:
```bash
# List all categories
bun run query:category

# Get products for a specific category
bun run query:category pecivo-1198
```

View the database in Drizzle Studio:
```bash
bun run db:studio
```

## Project Structure

```
src/
  ├── db/
  │   └── client.ts              # Database client setup
  ├── modules/
  │   ├── product/
  │   │   ├── product.schema.ts   # Product table schema
  │   │   ├── product.repository.ts # Database operations
  │   │   └── product.queries.ts  # Complex queries with JOINs
  │   ├── category/
  │   │   ├── category.schema.ts  # Category table schema
  │   │   ├── category.repository.ts # Category operations
  │   │   ├── product-categories.schema.ts # Junction table
  │   │   └── product-categories.repository.ts # Link operations
  │   └── scraper/
  │       ├── api.types.ts        # API response types
  │       └── scraper.service.ts  # Scraping logic
  └── index.ts                    # Main entry point
```

## Architecture

This project follows Clean Architecture principles with the Repository Pattern:
- **Schemas**: Define database tables and types
- **Repositories**: Handle all database operations
- **Services**: Business logic (scraping, data mapping)
- **No direct DB calls** outside repositories

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (Strict Mode)
- **Database**: SQLite (bun:sqlite)
- **ORM**: Drizzle ORM
