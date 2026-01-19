# How to Capture Working GraphQL Request from Browser

Follow these steps to get the exact working request from Foodora's website.

## Step 1: Open Foodora Website

1. Open https://www.foodora.cz in your browser
2. Open DevTools (F12 or Right Click → Inspect)
3. Go to **Network** tab
4. Enable **Preserve log** checkbox

## Step 2: Navigate to a Category

1. In Foodora website, click on a category (e.g., "Maso a uzeniny")
2. Then click on a subcategory (e.g., "Drůbež")
3. Wait for products to load

## Step 3: Find the GraphQL Request

In the Network tab:
1. Filter by "graphql" or look for requests to `cz.fd-api.com`
2. Find a request with:
   - **URL**: `https://cz.fd-api.com/api/v5/graphql`
   - **Method**: POST
   - **Type**: graphql or fetch

3. Click on that request

## Step 4: Inspect the Request

### Headers Tab
Look at **Request Headers**:
```
User-Agent: ...
Accept: application/json
Accept-Language: ...
Content-Type: application/json;charset=utf-8
perseus-client-id: <some-uuid>
perseus-session-id: <some-uuid>
X-PD-Language-ID: 3
apollographql-client-name: web
apollographql-client-version: ...
platform: web
Origin: https://www.foodora.cz
Referer: https://www.foodora.cz/...
Cookie: <if present>
```

### Payload Tab
Look at **Request Payload** (should be JSON):
```json
{
  "query": "query getProductsByCategoryList(...) { ... }",
  "variables": {
    "categoryId": "...",
    "vendorID": "...",
    ...
  }
}
```

### Response Tab
Check the **Response** (should show products):
```json
{
  "data": {
    "categoryProductList": {
      "categoryProducts": [
        {
          "id": "...",
          "name": "Drůbež",
          "items": [...]
        }
      ]
    }
  }
}
```

## Step 5: Copy as cURL

1. Right-click on the request in Network tab
2. Select **Copy → Copy as cURL**
3. Save it to a file: `working-category-request.sh`

Example cURL format:
```bash
curl 'https://cz.fd-api.com/api/v5/graphql' \
  -H 'User-Agent: Mozilla/5.0...' \
  -H 'Accept: application/json' \
  -H 'perseus-client-id: 12345...' \
  -H 'perseus-session-id: 67890...' \
  --data-raw '{"query":"query getProductsByCategoryList...","variables":{...}}'
```

## Step 6: Compare with Our Code

Compare the captured request with our implementation:

### Compare Headers
- `src/modules/foodora-scraper/foodora-category-api.service.ts` (line 93-114)
- Check if any headers are missing or different

### Compare Query
- `src/modules/foodora-scraper/foodora-category.queries.ts`
- Compare the GraphQL query string exactly
- Look for differences in fragment order, field names, etc.

### Compare Variables
- `src/modules/foodora-scraper/foodora-category-api.service.ts` (line 54-70)
- Check if all variables match
- Look for missing or extra variables

## Step 7: Test the cURL

Run the copied cURL command in terminal:
```bash
bash working-category-request.sh
```

If it works, you'll see JSON response with products.

## Step 8: Create a Working Request File

Save the working request details to compare:

Create `working-request-example.json`:
```json
{
  "url": "https://cz.fd-api.com/api/v5/graphql",
  "method": "POST",
  "headers": {
    "perseus-client-id": "captured-from-browser",
    "perseus-session-id": "captured-from-browser",
    "X-PD-Language-ID": "3",
    ...
  },
  "body": {
    "query": "exact query from browser",
    "variables": {
      "categoryId": "exact-value",
      "vendorID": "exact-value",
      ...
    }
  }
}
```

## Common Issues to Look For

### Missing Variables
- `customerID` vs `userCode`
- `globalEntityID` format
- `featureFlags` structure

### Header Differences
- Case sensitivity (e.g., `perseus-client-id` vs `Perseus-Client-Id`)
- Missing authentication headers
- Cookie requirements

### Query Structure
- Fragment placement
- Field order
- Field aliases

### Variable Types
- String vs Boolean vs Null
- Array format
- Enum values (e.g., `"Recommended"` vs `RECOMMENDED`)

## Debugging Tools

### Tool 1: Pretty Print cURL Body

Extract the `--data-raw` part from cURL and format it:
```bash
echo '{"query":"...","variables":{...}}' | jq .
```

### Tool 2: Compare JSON

Use online diff tools:
- https://www.jsondiff.com/
- Compare browser request variables vs our code variables

### Tool 3: Test in Postman/Insomnia

1. Import the cURL command
2. Modify variables to test different scenarios
3. See exact request/response

## What to Do Next

Once you have the working request:

1. **Update the code** to match the working request exactly
2. **Test with debug script**: `bun src/debug-category-variations.ts`
3. **Verify it works**: Check if `categoryProducts` is no longer null
4. **Run full scraper**: `bun src/foodora-category-scraper-cli.ts`

## Files to Update

If you find differences, update these files:

- `src/modules/foodora-scraper/foodora-category-api.service.ts` - Headers & variables
- `src/modules/foodora-scraper/foodora-category.queries.ts` - GraphQL query
- `src/modules/foodora-scraper/foodora.constants.ts` - Constants (vendor ID, etc.)
