# Agent Development Guidelines

This document provides coding standards, commands, and best practices for AI coding agents working in this repository.

## Runtime & Package Manager

**Always use Bun instead of Node.js**. This project is built with Bun runtime.

### Common Commands

```bash
# Run TypeScript files directly
bun <file.ts>

# Run with hot reload
bun --hot <file.ts>

# Install dependencies
bun install

# Run package.json scripts
bun run <script>

# Execute packages (like npx)
bunx <package> <command>
```

## Build, Lint & Test Commands

### Testing

```bash
# Run all tests
bun test

# Run a single test file
bun test path/to/test.test.ts

# Run tests with pattern matching
bun test --filter "test description"

# Run tests in watch mode
bun test --watch
```

### Building

```bash
# Build TypeScript/HTML/CSS files
bun build <file.ts|file.html|file.css>

# Build with options
bun build ./index.ts --outdir ./dist --target browser
```

### Type Checking

```bash
# Type check without emitting
bunx tsc --noEmit
```

## Code Style Guidelines

### Core Principles

**CRITICAL: Always use TypeScript for all code files. Never use JavaScript.**

- **TypeScript everywhere**: Use `.ts` extension for all files, including config files
- **ESM only**: Always use ES modules (`import/export`), never CommonJS (`require/module.exports`)
- **No classes**: Use functions and plain objects instead
- **No interfaces**: Use `type` keyword for all type definitions
- **No Record/Map**: Use plain objects `{ [key: string]: T }` or arrays
- **Always use const**: Never use `let` or `var` unless mutation is absolutely necessary
- **No any/unknown**: Always provide explicit types, never use `any` or `unknown`
- **No nested types**: Define types at the top level, don't nest type definitions
- **Validation**: Always use Zod for validating external/untrusted data
- **File organization**: Separate concerns into different files in `src/`
- **Readability**: Write clear, simple code over clever code

### TypeScript Configuration

This project uses strict TypeScript settings defined in `tsconfig.json`:
- `strict: true` - All strict type checking enabled
- `noUncheckedIndexedAccess: true` - Array/object index access returns `T | undefined`
- `noFallthroughCasesInSwitch: true` - Prevent switch fallthrough bugs
- `noImplicitOverride: true` - Require explicit `override` keyword
- `target: ESNext` & `module: Preserve` - Latest ECMAScript features
- `moduleResolution: bundler` - Bundler-specific resolution

### Imports & Modules

```typescript
// ✅ Good - Always use ES modules with .ts extension
import { foo } from "./utils.ts";
import type { User } from "./types.ts";

// ✅ Good - Relative imports within same module
import { findProductById } from "./product.repository.ts";
import { productSchema } from "./product.schema.ts";

// ✅ Good - Node-style imports across modules
import { db } from "../../shared/db/client.ts";
import { validateEmail } from "../../shared/utils/validation.ts";

// ✅ Good - Named exports for utilities
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ Good - Named exports for routes (prefer over default)
export const productRoutes = new Elysia({ prefix: "/products" })
  .get("/", () => "Products");

// ✅ Good - Import from Bun built-ins
import { Database } from "bun:sqlite";
import { serve } from "bun";

// ✅ Good - Import Zod for validation
import { z } from "zod";

// ✅ Good - Import Drizzle ORM
import { drizzle } from "drizzle-orm/bun-sqlite";
import { eq } from "drizzle-orm";

// ✅ Good - Import Elysia for API servers
import { Elysia } from "elysia";

// ❌ Bad - Don't use CommonJS
const express = require("express"); // Never use require
module.exports = { foo }; // Never use module.exports

// ❌ Bad - Don't use Node.js frameworks
import express from "express"; // Use Elysia instead
import fs from "node:fs"; // Use Bun.file() instead
```

### Type Safety & Validation

```typescript
// ✅ Good - Use Zod for runtime validation
import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>;

// ✅ Good - Validate data at runtime
const fetchData = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return userSchema.parse(data); // Throws if invalid
};

// ✅ Good - Use type instead of interface
type Product = {
  id: string;
  name: string;
  price: number;
};

type ProductWithCategory = Product & {
  category: string;
};

// ✅ Good - Always use const for functions
const getProduct = async (id: string): Promise<Product> => {
  // ...
};

// ✅ Good - No nested types, define at top level
type Address = {
  street: string;
  city: string;
};

type UserProfile = {
  name: string;
  address: Address; // Reference, not nested
};

// ❌ Bad - Using interface
interface User {
  id: string;
}

// ❌ Bad - Using Record, Map, or other non-standard types
type UserMap = Record<string, User>; // Don't use Record
const users = new Map<string, User>(); // Don't use Map

// ❌ Bad - Using `any` or `unknown`
const process = (data: any) => { }; // Never use any
const handle = (data: unknown) => { }; // Never use unknown

// ❌ Bad - Using `let` or `var`
let count = 0; // Use const instead
var name = "test"; // Never use var

// ❌ Bad - Nested type definitions
type User = {
  profile: { // Don't nest types
    address: {
      street: string;
    };
  };
};

// ❌ Bad - No validation on external data
const data = (await response.json()) as User; // Unsafe!
```

### Naming Conventions

```typescript
// ✅ Types: PascalCase
type ProductDetails = {
  id: string;
  name: string;
};
type UserId = string;

// ✅ Functions/variables: camelCase with const
const userName = "John";
const getUserData = (): User | null => {
  // ...
};

// ✅ Constants: SCREAMING_SNAKE_CASE or camelCase
const API_URL = "https://api.example.com";
const maxRetries = 3;

// ✅ File names: kebab-case with descriptive suffixes
// product.repository.ts (repository pattern)
// product-scraper.service.ts (Angular-style service naming)
// product-validator.service.ts (specific service name)
// user-authentication.service.ts (descriptive, not just "service.ts")

// ❌ Bad - Generic service names
// service.ts (too generic)
// products.service.ts (not descriptive enough)

// ❌ Bad - Don't use classes
class FoodoraScraper { } // Use functions instead

// ❌ Bad - Don't use interfaces
interface ProductDetails { } // Use type instead
```

### Error Handling

```typescript
// ✅ Good - Throw typed errors with context
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

// ✅ Good - Handle errors in async functions
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error("Failed to fetch data:", error);
  throw error;
}

// ❌ Bad - Silent failures
try {
  await riskyOperation();
} catch (error) {
  // Don't swallow errors silently
}
```

### Formatting & Style

- **Indentation**: 2 spaces (not tabs)
- **Quotes**: Double quotes for strings `"hello"`
- **Semicolons**: Required
- **Line length**: Prefer ~80 chars, max 100
- **Trailing commas**: Use in multiline arrays/objects

```typescript
// ✅ Good
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};

// ✅ Good - Multiline function parameters
function complexFunction(
  param1: string,
  param2: number,
  param3: boolean
): Result {
  // ...
}
```

## Bun-Specific Best Practices

### File Operations

```typescript
// ✅ Use Bun.file for file I/O
await Bun.write("output.json", JSON.stringify(data, null, 2));
const file = Bun.file("input.txt");
const content = await file.text();

// ❌ Avoid Node.js fs module
import fs from "node:fs"; // Don't use this
```

### API Server

**Use Elysia for building API servers with Bun.**

```typescript
// ✅ Good - Use Elysia with Zod validation
import { Elysia, t } from "elysia";
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const app = new Elysia()
  .get("/", () => "Hello World")
  .get("/users/:id", ({ params }) => {
    return { id: params.id, name: "John" };
  })
  .post("/users", ({ body }) => {
    // Validate with Zod
    const user = userSchema.parse(body);
    return { success: true, user };
  })
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);

// ✅ Good - Use Elysia with plugins
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .get("/api/health", () => ({ status: "ok" }))
  .listen(3000);

// ❌ Bad - Don't use Express or other Node.js frameworks
import express from "express";
const app = express(); // Use Elysia instead
```

### Database

**This project uses Drizzle ORM for all database operations.**

```typescript
// ✅ Define schema with Drizzle
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

// ✅ Use Drizzle-Zod to generate schemas from database tables
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// ✅ Infer types from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

// ✅ Use Drizzle ORM with type-safe queries
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./db/schema.ts";

const sqlite = new Database("mydb.sqlite");
const db = drizzle(sqlite, { schema });

// ✅ Type-safe queries
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.id, 1));

// ❌ Bad - Don't use raw SQL or native Database class for queries
const db = new Database("mydb.sqlite");
db.query("SELECT * FROM users"); // Use Drizzle instead

// ❌ Bad - Manually defining types when Drizzle-Zod can generate them
type User = {
  id: number;
  name: string;
  email: string;
}; // Use Drizzle-Zod instead
```

### Environment Variables

```typescript
// ✅ Bun auto-loads .env files
const apiKey = process.env.API_KEY;

// ❌ Don't import dotenv
import "dotenv/config"; // Unnecessary with Bun
```

### Shell Commands

```typescript
// ✅ Use Bun.$ for shell commands
const output = await Bun.$`ls -la`.text();

// ❌ Avoid child_process or execa
import { exec } from "child_process"; // Don't use
```

## Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms inline
- Keep README.md updated with setup instructions
- Use TypeScript types as primary documentation

```typescript
/**
 * Fetches product details from Foodora GraphQL API
 * @param productId - The unique product identifier
 * @param vendorCode - Vendor code (default: "o7b0")
 * @returns Product details with pricing and availability
 */
export async function getProductDetails(
  productId: string,
  vendorCode: string = "o7b0"
): Promise<ProductDetails> {
  const response = await fetch(/* ... */);
  const data = await response.json();
  
  // Always validate external data with Zod
  return productDetailsSchema.parse(data);
}
```

## Project Structure

Organize code using a **modules/features approach** (similar to NestJS) within the `src/` directory:

```
src/
├── modules/
│   ├── products/
│   │   ├── product.repository.ts       # Product data access layer
│   │   ├── product-scraper.service.ts  # Product scraping logic
│   │   ├── product.routes.ts           # Product routes (Elysia)
│   │   ├── product.schema.ts           # Product Drizzle schema + types
│   │   └── product.types.ts            # Product Zod schemas & types
│   ├── users/
│   │   ├── user.repository.ts          # User data access layer
│   │   ├── user-auth.service.ts        # User authentication logic
│   │   ├── user.routes.ts              # User routes (Elysia)
│   │   ├── user.schema.ts              # User Drizzle schema + types
│   │   └── user.types.ts               # User Zod schemas & types
│   └── orders/
│       ├── order.repository.ts
│       ├── order-processor.service.ts
│       ├── order.routes.ts
│       ├── order.schema.ts
│       └── order.types.ts
├── shared/
│   ├── db/
│   │   └── client.ts                   # Database client setup
│   ├── utils/
│   │   └── validation.ts               # Validation helpers
│   └── config.ts                       # Configuration (use .ts, not .js)
└── index.ts                            # Main entry point (Elysia app)
```

**Key principles:**
- Group by feature/module (products, users, orders), not by technical concern
- Each module contains its own repository, services, routes, schemas, and types
- Shared/common code goes in `shared/` directory
- Use relative imports within modules, node-style imports across modules

**IMPORTANT: All config files must be TypeScript (`.ts`) using ESM syntax:**

```typescript
// ✅ Good - drizzle.config.ts (TypeScript + ESM)
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./db.sqlite",
  },
});

// ✅ Good - src/config.ts (TypeScript + ESM)
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  API_KEY: z.string(),
  PORT: z.coerce.number().default(3000),
});

export const config = envSchema.parse(process.env);

// ❌ Bad - drizzle.config.js (JavaScript)
module.exports = { /* ... */ }; // Never use this

// ❌ Bad - config.js (CommonJS)
const config = require("./config"); // Never use this
```

### File Organization Examples

```typescript
// ✅ Good - src/modules/products/product.schema.ts (Drizzle schema)
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
});

// Generate Zod schemas from Drizzle tables
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

// Infer types from generated schemas
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = z.infer<typeof selectProductSchema>;

// ✅ Good - src/modules/products/product.types.ts (External API types)
import { z } from "zod";

export const externalProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

export type ExternalProduct = z.infer<typeof externalProductSchema>;

// ✅ Good - src/modules/products/product.repository.ts
import { eq } from "drizzle-orm";
import { db } from "../../shared/db/client.ts";
import { products } from "./product.schema.ts";
import type { Product, InsertProduct } from "./product.schema.ts";

export const findProductById = async (id: string): Promise<Product | null> => {
  const result = await db.select().from(products).where(eq(products.id, id));
  return result[0] ?? null;
};

export const createProduct = async (data: InsertProduct): Promise<Product> => {
  const result = await db.insert(products).values(data).returning();
  return result[0]!;
};

export const findAllProducts = async (): Promise<Product[]> => {
  return await db.select().from(products);
};

// ✅ Good - src/modules/products/product-scraper.service.ts
import type { Product } from "./product.schema.ts";
import { externalProductSchema } from "./product.types.ts";
import { createProduct } from "./product.repository.ts";

export const scrapeAndSaveProduct = async (url: string): Promise<Product> => {
  const response = await fetch(url);
  const data = await response.json();
  const validated = externalProductSchema.parse(data);
  
  return await createProduct(validated);
};

// ✅ Good - src/modules/products/product.routes.ts (Elysia routes)
import { Elysia } from "elysia";
import { findProductById, createProduct } from "./product.repository.ts";
import { scrapeAndSaveProduct } from "./product-scraper.service.ts";
import { insertProductSchema } from "./product.schema.ts";

export const productRoutes = new Elysia({ prefix: "/products" })
  .get("/:id", async ({ params }) => {
    const product = await findProductById(params.id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  })
  .post("/", async ({ body }) => {
    const validated = insertProductSchema.parse(body);
    return await createProduct(validated);
  });

// ✅ Good - src/index.ts (Main Elysia app)
import { Elysia } from "elysia";
import { productRoutes } from "./modules/products/product.routes.ts";
import { userRoutes } from "./modules/users/user.routes.ts";

const app = new Elysia()
  .get("/", () => "API Server")
  .use(productRoutes)
  .use(userRoutes)
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
```

## Additional Notes

- **Always use TypeScript** - Never write JavaScript files (even for config)
- **Always use ESM** - Never use CommonJS (`require`/`module.exports`)
- **No classes** - Use functional programming patterns
- **Use Elysia** - For building API servers with Bun
- **Use Zod** - Validate all external data (API responses, user input, env vars)
- **Use Drizzle ORM** - All database operations go through Drizzle
- **Use Drizzle-Zod** - Generate schemas and types from database tables
- **Repository pattern** - Use `.repository.ts` suffix for data access layer
- **Descriptive service names** - Use Angular-style naming (e.g., `product-scraper.service.ts`)
- **Always use const** - Avoid `let` and `var` unless absolutely necessary
- **No any/unknown** - Always provide explicit types
- **No nested types** - Define all types at the top level
- **Config files in TypeScript** - `drizzle.config.ts`, not `.js` or `.mjs`
- No linter is configured - follow TypeScript compiler errors
- Test files should use `.test.ts` suffix
- Prefer composition over inheritance (don't use classes anyway)
- Keep functions small and focused (single responsibility)
- Separate concerns into different files for better readability

