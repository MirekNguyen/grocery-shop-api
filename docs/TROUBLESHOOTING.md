# Category API Troubleshooting Guide

## Current Issue

The Foodora category API is returning `null` for `categoryProducts` instead of an array of products.

```json
{
  "data": {
    "categoryProductList": {
      "categoryProducts": null
    }
  }
}
```

## Debugging Steps

### Step 1: Run the Debug Script

```bash
bun src/debug-category-api.ts
```

This will show you the exact API response. Look for:
- Is `categoryProducts` actually `null`?
- Are there any GraphQL errors in the response?
- Does the response structure match our schema?

### Step 2: Compare with Working Browser Request

1. Open https://www.foodora.cz in your browser
2. Open DevTools → Network tab
3. Navigate to a category (e.g., "Drůbež")
4. Find the GraphQL request to `cz.fd-api.com/api/v5/graphql`
5. Copy the exact request as cURL

**Key things to compare:**
- Request headers (especially `perseus-client-id`, `perseus-session-id`)
- GraphQL query structure
- Variables sent in the request
- Vendor ID and other IDs

### Step 3: Test with Minimal Query

Try simplifying the GraphQL query to see if it's a query structure issue:

```typescript
// Minimal query - test in debug-category-api.ts
const MINIMAL_QUERY = `
  query getProductsByCategoryList(
    $categoryId: String!
    $vendorID: String!
  ) {
    categoryProductList(
      input: {
        categoryID: $categoryId
        vendorID: $vendorID
        platform: "web"
      }
    ) {
      categoryProducts {
        id
        name
      }
    }
  }
`;
```

## Potential Fixes

### Fix 1: Check Category ID Format

The category ID might need to be from the current vendor context. Try:

```typescript
// In debug-category-api.ts, try different category IDs:
const categoryId = "aef9f1fe-ffe4-4754-8f27-4bb8359e2427"; // Current
// OR try with parent category
const categoryId = "8d101a5c-84cb-4d02-8247-a47d423d4691"; // Parent "Maso a uzeniny"
```

### Fix 2: Add Missing Variables

Based on the GraphQL schema, these variables might be required:

```typescript
// In foodora-category-api.service.ts
const variables = {
  categoryId,
  vendorID: vendorCode,
  userCode,
  globalEntityId: DEFAULT_GLOBAL_ENTITY_ID,
  locale: DEFAULT_LOCALE,
  isDarkstore: false,
  platform: "web",
  
  // Try adding these:
  attributes: DEFAULT_ATTRIBUTES,
  featureFlags: DEFAULT_FEATURE_FLAGS,
  filterOnSale: null, // Try null instead of false
  sort: null, // Try null instead of "Recommended"
};
```

### Fix 3: Check Headers Match Browser

Compare headers from browser request with our code:

```typescript
// Missing headers to try:
"Cookie": "...", // May be required for authentication
"x-disco-client-id": "...", // Alternative to perseus-client-id
"x-disco-session-id": "...", // Alternative to perseus-session-id
```

### Fix 4: Use Different API Endpoint

The category API might use a different endpoint or version:

```typescript
// Try these endpoints:
const API_URL_V5 = "https://cz.fd-api.com/api/v5/graphql";
const API_URL_V1 = "https://cz.fd-api.com/api/v1/graphql";
const API_URL_LEGACY = "https://cz.fd-api.com/graphql";
```

### Fix 5: Check Vendor Context

The vendor code might need to be obtained dynamically:

```typescript
// First, call vendor API to get vendor details
const vendorResponse = await fetch("https://cz.fd-api.com/api/v1/vendors/o7b0");
const vendorData = await vendorResponse.json();

// Use vendor ID from response
const vendorID = vendorData.vendor.id; // Instead of "o7b0"
```

## Testing Checklist

- [ ] Run `bun src/debug-category-api.ts` and check response
- [ ] Compare GraphQL query with browser request
- [ ] Verify all variables match browser request
- [ ] Check headers match browser request (especially perseus IDs)
- [ ] Test with parent category ID
- [ ] Test with minimal GraphQL query
- [ ] Try different vendor codes
- [ ] Check if authentication/cookies are required
- [ ] Test with different API endpoint versions

## Expected Working Response

When working correctly, you should see:

```json
{
  "data": {
    "categoryProductList": {
      "categoryProducts": [
        {
          "id": "aef9f1fe-ffe4-4754-8f27-4bb8359e2427",
          "name": "Drůbež",
          "items": [
            {
              "productID": "119528257",
              "name": "DZ Klatovy Kuřecí steak...",
              "price": 79.9,
              ...
            }
          ]
        }
      ]
    }
  }
}
```

## If Nothing Works

As a fallback, you can:

1. **Use browser automation** (Puppeteer/Playwright) to scrape categories
2. **Intercept browser requests** to capture exact working requests
3. **Use product scraper** - Scrape individual products if you have product IDs
4. **Contact Foodora** - Check if they have a public API or documentation

## Related Files

- `src/debug-category-api.ts` - Debug script
- `src/modules/foodora-scraper/foodora-category-api.service.ts` - API service
- `src/modules/foodora-scraper/foodora-category.queries.ts` - GraphQL queries
- `src/modules/foodora-scraper/foodora-category.schemas.ts` - Zod validation schemas
