/**
 * Debug Category API - Test Multiple Variations
 * Tests different category IDs, query formats, and variables
 */

import { FOODORA_API_URL, DEFAULT_VENDOR_CODE, DEFAULT_USER_CODE, DEFAULT_GLOBAL_ENTITY_ID, DEFAULT_LOCALE, DEFAULT_FEATURE_FLAGS } from "./modules/foodora-scraper/foodora.constants.ts";
import { generatePerseusClientId, generatePerseusSessionId } from "./modules/foodora-scraper/foodora.utils.ts";

// ============================================================================
// Test Configurations
// ============================================================================

const TEST_CATEGORIES = [
  { id: "aef9f1fe-ffe4-4754-8f27-4bb8359e2427", name: "Drůbež (Poultry)" },
  { id: "8d101a5c-84cb-4d02-8247-a47d423d4691", name: "Maso a uzeniny (Meat & Deli) - Parent" },
];

// ============================================================================
// GraphQL Queries
// ============================================================================

// Full query (current implementation)
const FULL_QUERY = `
  fragment ProductFields on Product {
    productID
    name
    price
    originalPrice
    isAvailable
    description
  }

  query getProductsByCategoryList(
    $attributes: [String!]
    $categoryId: String!
    $featureFlags: [FunWithFlag!]
    $filterOnSale: Boolean
    $globalEntityId: String!
    $isDarkstore: Boolean!
    $locale: String!
    $sort: ProductsSortType
    $userCode: String
    $vendorID: String!
  ) {
    categoryProductList(
      input: {
        categoryID: $categoryId
        customerID: $userCode
        filterOnSale: $filterOnSale
        funWithFlags: $featureFlags
        globalEntityID: $globalEntityId
        isDarkstore: $isDarkstore
        locale: $locale
        platform: "web"
        sort: $sort
        vendorID: $vendorID
      }
    ) {
      categoryProducts {
        id
        name
        items {
          ...ProductFields
        }
      }
    }
  }
`;

// Minimal query (testing if full query is the issue)
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

// ============================================================================
// Test Functions
// ============================================================================

const testCategoryAPI = async (
  categoryId: string,
  categoryName: string,
  query: string,
  variables: Record<string, unknown>
): Promise<void> => {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Testing: ${categoryName}`);
  console.log(`Category ID: ${categoryId}`);
  console.log(`Query Type: ${query === FULL_QUERY ? "FULL" : "MINIMAL"}`);
  console.log(`${"=".repeat(80)}\n`);

  const perseusClientId = generatePerseusClientId();
  const perseusSessionId = generatePerseusSessionId();

  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Referer": "https://www.foodora.cz/",
    "Content-Type": "application/json;charset=utf-8",
    "perseus-client-id": perseusClientId,
    "perseus-session-id": perseusSessionId,
    "X-PD-Language-ID": "3",
    "X-Requested-With": "XMLHttpRequest",
    "apollographql-client-name": "web",
    "apollographql-client-version": "GROCERIES-MENU-MICROFRONTEND.26.03.0016",
    "platform": "web",
    "Origin": "https://www.foodora.cz",
    "Sec-GPC": "1",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
  };

  try {
    console.log("Request Body:");
    console.log(JSON.stringify({ query, variables }, null, 2));

    const response = await fetch(FOODORA_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    console.log(`\nResponse Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    console.log("\nResponse Data:");
    console.log(JSON.stringify(data, null, 2));

    // Check for errors
    if (data.errors) {
      console.log("\n❌ GraphQL Errors:");
      data.errors.forEach((error: { message: string; path?: string[] }) => {
        console.log(`  - ${error.message}`);
        if (error.path) {
          console.log(`    Path: ${error.path.join(" → ")}`);
        }
      });
    }

    // Check categoryProducts
    const categoryProducts = data?.data?.categoryProductList?.categoryProducts;
    if (categoryProducts === null) {
      console.log("\n⚠️  categoryProducts is null");
    } else if (Array.isArray(categoryProducts)) {
      console.log(`\n✅ categoryProducts is an array with ${categoryProducts.length} items`);
      if (categoryProducts.length > 0) {
        console.log(`   First item: ${categoryProducts[0]?.name} (${categoryProducts[0]?.items?.length || 0} products)`);
      }
    } else {
      console.log("\n❓ categoryProducts has unexpected type:", typeof categoryProducts);
    }

  } catch (error) {
    console.error("\n❌ Request Error:");
    console.error(error);
  }
};

// ============================================================================
// Main Test Runner
// ============================================================================

const main = async (): Promise<void> => {
  console.log("\n🔍 Category API Variation Testing");
  console.log(`Started at: ${new Date().toISOString()}\n`);

  const DEFAULT_ATTRIBUTES = [
    "baseContentValue",
    "baseUnit",
    "freshnessGuaranteeInDays",
    "maximumSalesQuantity",
    "minPriceLastMonth",
    "pricePerBaseUnit",
    "sku",
    "nutri_grade",
    "sugar_level",
  ];

  // Test 1: Full query with full variables - Drůbež (subcategory)
  await testCategoryAPI(
    TEST_CATEGORIES[0]!.id,
    TEST_CATEGORIES[0]!.name,
    FULL_QUERY,
    {
      categoryId: TEST_CATEGORIES[0]!.id,
      attributes: DEFAULT_ATTRIBUTES,
      featureFlags: DEFAULT_FEATURE_FLAGS,
      filterOnSale: false,
      globalEntityId: DEFAULT_GLOBAL_ENTITY_ID,
      isDarkstore: false,
      locale: DEFAULT_LOCALE,
      sort: "Recommended",
      userCode: DEFAULT_USER_CODE,
      vendorID: DEFAULT_VENDOR_CODE,
    }
  );

  // Test 2: Minimal query - Drůbež (subcategory)
  await testCategoryAPI(
    TEST_CATEGORIES[0]!.id,
    TEST_CATEGORIES[0]!.name + " (MINIMAL)",
    MINIMAL_QUERY,
    {
      categoryId: TEST_CATEGORIES[0]!.id,
      vendorID: DEFAULT_VENDOR_CODE,
    }
  );

  // Test 3: Full query - Parent category (Maso a uzeniny)
  await testCategoryAPI(
    TEST_CATEGORIES[1]!.id,
    TEST_CATEGORIES[1]!.name,
    FULL_QUERY,
    {
      categoryId: TEST_CATEGORIES[1]!.id,
      attributes: DEFAULT_ATTRIBUTES,
      featureFlags: DEFAULT_FEATURE_FLAGS,
      filterOnSale: false,
      globalEntityId: DEFAULT_GLOBAL_ENTITY_ID,
      isDarkstore: false,
      locale: DEFAULT_LOCALE,
      sort: "Recommended",
      userCode: DEFAULT_USER_CODE,
      vendorID: DEFAULT_VENDOR_CODE,
    }
  );

  // Test 4: Full query with null for optional params - Drůbež
  await testCategoryAPI(
    TEST_CATEGORIES[0]!.id,
    TEST_CATEGORIES[0]!.name + " (NULL OPTIONALS)",
    FULL_QUERY,
    {
      categoryId: TEST_CATEGORIES[0]!.id,
      attributes: DEFAULT_ATTRIBUTES,
      featureFlags: DEFAULT_FEATURE_FLAGS,
      filterOnSale: null,
      globalEntityId: DEFAULT_GLOBAL_ENTITY_ID,
      isDarkstore: false,
      locale: DEFAULT_LOCALE,
      sort: null,
      userCode: DEFAULT_USER_CODE,
      vendorID: DEFAULT_VENDOR_CODE,
    }
  );

  console.log("\n" + "=".repeat(80));
  console.log("Testing Complete!");
  console.log(`Finished at: ${new Date().toISOString()}`);
  console.log("=".repeat(80) + "\n");
};

if (import.meta.main) {
  main();
}
