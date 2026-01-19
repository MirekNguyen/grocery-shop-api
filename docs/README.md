# Documentation

Complete documentation for the Shop Scraper project (Billa & Foodora scrapers).

## 🎯 Quick Start

| Need | Document |
|------|----------|
| **Foodora scraper overview** | [FOODORA-README.md](./FOODORA-README.md) |
| **Quick commands** | [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) |
| **Fix category API** | [CATEGORY-API-FIX.md](./CATEGORY-API-FIX.md) |
| **All documentation** | [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md) |

---

## 📚 Documentation Files

### Foodora Scraper

| File | Purpose |
|------|---------|
| [FOODORA-README.md](./FOODORA-README.md) | Main README for Foodora scraper |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Quick commands and workflow |
| [CATEGORY-SCRAPER.md](./CATEGORY-SCRAPER.md) | Category scraper API reference |
| [SCRAPING-STRATEGIES.md](./SCRAPING-STRATEGIES.md) | Different scraping strategies |

### Debugging & Troubleshooting

| File | Purpose |
|------|---------|
| [CATEGORY-API-FIX.md](./CATEGORY-API-FIX.md) | Recent fix for category API |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Comprehensive debugging guide |
| [CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md) | How to capture working requests |

### Project Status

| File | Purpose |
|------|---------|
| [SESSION-SUMMARY.md](./SESSION-SUMMARY.md) | What was built, current status |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Visual architecture diagrams |
| [CLEANUP-SUMMARY.md](./CLEANUP-SUMMARY.md) | Files removed and cleaned up |

### Development

| File | Purpose |
|------|---------|
| [AGENTS.md](./AGENTS.md) | Coding standards and guidelines |
| [API_DOCS.md](./API_DOCS.md) | Original Billa API documentation |

### Legacy / Reference

| File | Purpose |
|------|---------|
| [CHANGELOG_FRONTEND.md](./CHANGELOG_FRONTEND.md) | Frontend changelog |
| [FTS_SEARCH.md](./FTS_SEARCH.md) | Full-text search documentation |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Database migration guide |
| [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) | Migration summary |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Billa scraper project summary |
| [QUICKSTART.md](./QUICKSTART.md) | Quick start for Billa scraper |
| [REACT_APP_PROMPT.md](./REACT_APP_PROMPT.md) | React app prompt |

---

## 📖 Documentation Index

For a complete, categorized index of all documentation, see:
**[DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)**

---

## 🗂️ Project Structure

```
shop-scraper/
├── docs/                       # All documentation (you are here)
│   ├── FOODORA-README.md       # Foodora scraper main docs
│   ├── QUICK-REFERENCE.md      # Quick reference
│   └── ...                     # Other docs
│
├── src/                        # Source code
│   ├── modules/
│   │   ├── foodora-scraper/    # Foodora scraper module
│   │   ├── category/           # Billa categories
│   │   ├── product/            # Billa products
│   │   └── scraper/            # Billa scraper
│   └── ...
│
├── output/                     # All scraper output files
│   ├── product-*.json
│   ├── category-*.json
│   └── scraped-categories/
│
└── README.md                   # Main project README
```

---

## 🚀 Getting Started

1. **For Foodora scraper:** Read [FOODORA-README.md](./FOODORA-README.md)
2. **For quick commands:** Read [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
3. **For debugging:** Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📝 Contributing

When adding new documentation:
1. Place it in the `docs/` folder
2. Update this README
3. Update [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)
4. Use clear, descriptive filenames
5. Follow the existing documentation style
