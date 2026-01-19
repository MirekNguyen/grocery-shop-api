# Quick Reference - Foodora Scraper

## 🚀 Quick Commands

```bash
# ⭐ SCRAPE ALL PRODUCTS (see HOW-TO-SCRAPE-ALL-PRODUCTS.md)
bun src/foodora-category-scraper-cli.ts  # Uncomment Example 3 first

# Test the category API fix (RECOMMENDED FIRST)
bun src/test-category-fix.ts

# Test product scraper (1 product only)
bun src/foodora-scraper-cli.ts

# Debug category API (test variations)
bun src/debug-category-variations.ts

# Debug category API (simple)
bun src/debug-category-api.ts

# Type check
bunx tsc --noEmit

# Run tests
bun test
```

## ⚠️ Important: Product Scraper vs Category Scraper

| Scraper | Input | Output | Use For |
|---------|-------|--------|---------|
| **Product** | Product ID | 1 product | Single product details |
| **Category** | Category ID(s) | Many products | Bulk scraping (ALL products) |

**To scrape ALL products:** Use category scraper, not product scraper!  
**See:** [HOW-TO-SCRAPE-ALL-PRODUCTS.md](./HOW-TO-SCRAPE-ALL-PRODUCTS.md)

## 📁 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `CATEGORY-API-FIX.md` | **Fix applied! Test this** | ✅ **READ THIS** |
| `SESSION-SUMMARY.md` | What we did, what's next | ✅ Full context |
| `TROUBLESHOOTING.md` | How to fix category API | ✅ Debug guide |
| `CAPTURE-BROWSER-REQUEST.md` | How to capture working request | ✅ Step-by-step |
| `CATEGORY-SCRAPER.md` | Category scraper docs | ✅ API reference |
| `src/test-category-fix.ts` | **Test the fix** | ⭐ **RUN THIS** |
| `src/debug-category-variations.ts` | Test 4 API variations | ✅ Run this |
| `src/modules/foodora-scraper/` | Main scraper code | ✅ Core module |

## 🔧 Debugging Flow

1. **✅ FIX APPLIED! Test it:**
   ```bash
   bun src/test-category-fix.ts
   ```

2. **If still not working, run debug script:**
   ```bash
   bun src/debug-category-variations.ts
   ```

3. **Capture browser request:**
   - Open https://www.foodora.cz
   - DevTools → Network → Navigate to category
   - Copy GraphQL request as cURL
   - Compare with our code

4. **Find the difference:**
   - Headers mismatch?
   - Variables missing/wrong?
   - Query structure different?

4. **Apply fix:**
   - Update `foodora-category-api.service.ts`
   - Or update `foodora-category.queries.ts`

5. **Test:**
   ```bash
   bun src/debug-category-api.ts
   ```

6. **If successful, run full scraper:**
   ```bash
   bun src/foodora-category-scraper-cli.ts
   ```

## 📊 Current Status

### ✅ Working
- Product scraper (single products)
- Modular architecture
- Type safety with Zod
- File saving

### ⚠️ Needs Fix
- Category API returns `null` for `categoryProducts`
- Need to identify why (likely variables or query mismatch)

## 🎯 Categories to Scrape

22 main categories, 100+ subcategories, 6000+ products total:

| Category | Products | Subcategories |
|----------|----------|---------------|
| Více za méně | 33 | 0 |
| Ovoce a zelenina | 120 | 4 |
| Pečivo | 214 | 7 |
| Maso a uzeniny | 158 | 7 |
| Nápoje | 933 | 11 |
| ... | ... | ... |

## 🔑 Test Category IDs

```typescript
// Subcategory (Drůbež - Poultry)
const categoryId = "aef9f1fe-ffe4-4754-8f27-4bb8359e2427";

// Parent category (Maso a uzeniny - Meat & Deli)
const parentId = "8d101a5c-84cb-4d02-8247-a47d423d4691";
```

## 💡 Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| `categoryProducts: null` | Variables mismatch | Compare with browser |
| GraphQL errors | Query structure wrong | Copy exact query from browser |
| 401/403 errors | Auth required | Include cookies |
| Empty response | Wrong vendor/user code | Use values from browser |

## 📖 Usage Examples

### Scrape Single Category
```typescript
import { scrapeCategoryProducts } from "./modules/foodora-scraper/index.ts";

const products = await scrapeCategoryProducts(
  "aef9f1fe-ffe4-4754-8f27-4bb8359e2427" // Drůbež
);

console.log(`Found ${products.length} products`);
```

### Scrape Category Tree
```typescript
import { scrapeCategoryTree } from "./modules/foodora-scraper/index.ts";

const category = {
  id: "8d101a5c-84cb-4d02-8247-a47d423d4691",
  name: "Maso a uzeniny",
  numberOfProducts: 158,
  type: "DEFAULT",
  children: [ /* subcategories */ ],
};

const results = await scrapeCategoryTree(
  [category],
  undefined,
  undefined,
  (current, total, name) => {
    console.log(`[${current}/${total}] ${name}`);
  }
);
```

### Save Results
```typescript
import { saveAllCategoriesToSingleFile } from "./modules/foodora-scraper/index.ts";

await saveAllCategoriesToSingleFile(results, "all-products.json");
```

## 🎓 Code Style Reminders

- ✅ Use `type` not `interface`
- ✅ Use `const` not `let`
- ✅ Always `.ts` extension (even for imports)
- ✅ Validate with Zod
- ✅ No classes, only functions
- ✅ No `any` or `unknown`

## 📞 When Stuck

1. Read `SESSION-SUMMARY.md` - Full context
2. Read `TROUBLESHOOTING.md` - Debugging steps
3. Read `CAPTURE-BROWSER-REQUEST.md` - How to get working request
4. Compare browser request with our code
5. Update code to match browser request exactly

## 🎉 Success Criteria

You'll know it works when:
- `categoryProducts` returns array (not null) ✅
- Products have correct data ✅
- Can scrape all 6000+ products ✅
- No TypeScript errors ✅
- No runtime errors ✅

---

**Start Here:** `bun src/debug-category-variations.ts`
