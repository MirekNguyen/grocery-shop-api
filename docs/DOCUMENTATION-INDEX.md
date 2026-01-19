# Documentation Index

Welcome to the Foodora Scraper documentation! This index will help you find what you need.

## 🎯 Start Here

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[CATEGORY-API-FIX.md](./CATEGORY-API-FIX.md)** | ⭐ **FIX APPLIED - TEST THIS!** | Right now! |
| **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** | Quick commands, common tasks | Always start here! |
| **[FOODORA-README.md](./FOODORA-README.md)** | Project overview, features, setup | New to the project |

## 📊 Status & Progress

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[SESSION-SUMMARY.md](./SESSION-SUMMARY.md)** | What we built, current status | Want full context |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Visual diagrams, data flow | Understand structure |
| **[CLEANUP-SUMMARY.md](./CLEANUP-SUMMARY.md)** | Files removed, cleanup notes | See what was cleaned up |

## 🐛 Debugging & Troubleshooting

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Fix category API returning null | Category API broken |
| **[CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md)** | How to capture working GraphQL request | Need exact browser request |

## 📖 API Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[CATEGORY-SCRAPER.md](./CATEGORY-SCRAPER.md)** | Category scraper API docs | Using category scraper |
| **[src/modules/foodora-scraper/README.md](./src/modules/foodora-scraper/README.md)** | Product scraper API docs | Using product scraper |

## 🎨 Development

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[AGENTS.md](./AGENTS.md)** | Coding standards, guidelines | Writing code |
| **[API_DOCS.md](./API_DOCS.md)** | Original API documentation | Understanding Billa API |

## 📁 Quick Access by Task

### I want to...

#### **...get started quickly**
→ [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)

#### **...understand what was built**
→ [SESSION-SUMMARY.md](./SESSION-SUMMARY.md)

#### **...fix the category API**
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

#### **...capture a working request**
→ [CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md)

#### **...understand the architecture**
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

#### **...use the product scraper**
→ [FOODORA-README.md](./FOODORA-README.md) → Usage Examples

#### **...use the category scraper**
→ [CATEGORY-SCRAPER.md](./CATEGORY-SCRAPER.md)

#### **...follow coding standards**
→ [AGENTS.md](./AGENTS.md)

## 🚀 Quick Start Path

1. **Read:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) (2 min)
2. **Run:** `bun src/debug-category-variations.ts` (5 min)
3. **Follow:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) (15 min)
4. **Capture:** [CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md) (10 min)
5. **Fix:** Apply changes based on comparison (10 min)
6. **Test:** `bun src/debug-category-api.ts` (2 min)
7. **Done!** 🎉

## 📊 Documentation Map

```
Documentation
│
├─── Getting Started
│    ├── QUICK-REFERENCE.md ⭐ START HERE
│    └── FOODORA-README.md
│
├─── Project Status
│    ├── SESSION-SUMMARY.md
│    └── ARCHITECTURE.md
│
├─── Debugging
│    ├── TROUBLESHOOTING.md ⚠️ FIX CATEGORY API
│    └── CAPTURE-BROWSER-REQUEST.md
│
├─── API Reference
│    ├── CATEGORY-SCRAPER.md
│    └── src/modules/foodora-scraper/README.md
│
└─── Development
     ├── AGENTS.md (coding standards)
     └── API_DOCS.md (original Billa API)
```

## 🔍 Search Guide

| Looking for... | Found in... |
|----------------|-------------|
| Quick commands | QUICK-REFERENCE.md |
| What we built | SESSION-SUMMARY.md |
| How to fix category API | TROUBLESHOOTING.md |
| How to capture browser request | CAPTURE-BROWSER-REQUEST.md |
| Architecture diagrams | ARCHITECTURE.md |
| Category scraper API | CATEGORY-SCRAPER.md |
| Product scraper API | src/modules/foodora-scraper/README.md |
| Coding standards | AGENTS.md |
| TypeScript types | src/modules/foodora-scraper/*.types.ts |
| Zod schemas | src/modules/foodora-scraper/*.schemas.ts |
| GraphQL queries | src/modules/foodora-scraper/*.queries.ts |
| API service | src/modules/foodora-scraper/*-api.service.ts |
| Scraper logic | src/modules/foodora-scraper/*-scraper.service.ts |

## 📝 File Organization

```
shop-scraper/
│
├── Documentation (You are here)
│   ├── QUICK-REFERENCE.md ⭐
│   ├── FOODORA-README.md
│   ├── SESSION-SUMMARY.md
│   ├── ARCHITECTURE.md
│   ├── TROUBLESHOOTING.md
│   ├── CAPTURE-BROWSER-REQUEST.md
│   ├── CATEGORY-SCRAPER.md
│   ├── AGENTS.md
│   └── DOCUMENTATION-INDEX.md (this file)
│
├── Source Code
│   ├── src/modules/foodora-scraper/
│   │   ├── *.service.ts (business logic)
│   │   ├── *.types.ts (TypeScript types)
│   │   ├── *.schemas.ts (Zod validation)
│   │   ├── *.queries.ts (GraphQL queries)
│   │   └── README.md (module docs)
│   │
│   ├── src/foodora-scraper-cli.ts ✅
│   ├── src/foodora-category-scraper-cli.ts ⚠️
│   ├── src/debug-category-api.ts
│   └── src/debug-category-variations.ts
│
└── Configuration
    ├── package.json
    ├── tsconfig.json
    ├── drizzle.config.ts
    └── .env
```

## 🎯 Common Tasks

| Task | Command | Documentation |
|------|---------|---------------|
| Debug category API | `bun src/debug-category-variations.ts` | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Test product scraper | `bun src/foodora-scraper-cli.ts` | [FOODORA-README.md](./FOODORA-README.md) |
| Capture browser request | DevTools → Network | [CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md) |
| Type check | `bunx tsc --noEmit` | [AGENTS.md](./AGENTS.md) |
| Run tests | `bun test` | [FOODORA-README.md](./FOODORA-README.md) |

## 📚 Reading Order

### If you're new to the project:
1. [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Quick overview
2. [FOODORA-README.md](./FOODORA-README.md) - Full introduction
3. [SESSION-SUMMARY.md](./SESSION-SUMMARY.md) - What was built
4. [ARCHITECTURE.md](./ARCHITECTURE.md) - How it's structured

### If you need to fix the category API:
1. [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Quick debugging steps
2. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Detailed troubleshooting
3. [CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md) - Capture working request
4. [CATEGORY-SCRAPER.md](./CATEGORY-SCRAPER.md) - API reference

### If you want to understand the code:
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Visual diagrams
2. [AGENTS.md](./AGENTS.md) - Coding standards
3. [src/modules/foodora-scraper/README.md](./src/modules/foodora-scraper/README.md) - Module docs

## 🆘 Help

**Still can't find what you need?**

1. Check [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) first
2. Use search (Cmd+Shift+F) to find keywords across all docs
3. Check the code directly in `src/modules/foodora-scraper/`
4. Read inline JSDoc comments in TypeScript files

## 📊 Statistics

- **Total Documentation Files:** 9
- **Total Source Files:** 15+
- **Lines of Code:** 2000+
- **Test Scripts:** 2 debug scripts
- **Working Features:** Product scraper ✅
- **In Progress:** Category scraper ⚠️

---

**Current Status:** Category API returning `null` - Ready for debugging  
**Next Step:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) → `bun src/debug-category-variations.ts`
