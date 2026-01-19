/**
 * Compare Browser Request with Our Implementation
 * 
 * Instructions:
 * 1. Capture browser request from DevTools (see CAPTURE-BROWSER-REQUEST.md)
 * 2. Paste the variables JSON below in BROWSER_VARIABLES
 * 3. Run: bun src/compare-requests.ts
 */

// Paste the variables from browser DevTools here
const BROWSER_VARIABLES = {
  // Example - replace with actual values from browser:
  // categoryId: "aef9f1fe-ffe4-4754-8f27-4bb8359e2427",
  // vendorID: "o7b0",
  // ... etc
};

// Our current implementation variables
const OUR_VARIABLES = {
  categoryId: "aef9f1fe-ffe4-4754-8f27-4bb8359e2427",
  featureFlags: [
    {
      key: "pd-qc-weight-stepper",
      value: "Variation1",
    },
  ],
  filterOnSale: false,
  globalEntityId: "DJ_CZ",
  isDarkstore: false,
  locale: "cs_CZ",
  sort: "Recommended",
  userCode: "cz6a15cx",
  vendorID: "o7b0",
};

const main = (): void => {
  console.log("🔍 Comparing Variables\n");
  console.log("=" .repeat(80));
  
  if (Object.keys(BROWSER_VARIABLES).length === 0) {
    console.log("⚠️  BROWSER_VARIABLES is empty!");
    console.log("\nPlease:");
    console.log("1. Open https://www.foodora.cz");
    console.log("2. DevTools → Network → Filter 'graphql'");
    console.log("3. Navigate to any category");
    console.log("4. Click on the GraphQL request");
    console.log("5. Go to 'Payload' tab");
    console.log("6. Copy the 'variables' JSON object");
    console.log("7. Paste it into BROWSER_VARIABLES in this file");
    console.log("\nThen run: bun src/compare-requests.ts");
    return;
  }
  
  console.log("Browser Variables:");
  console.log(JSON.stringify(BROWSER_VARIABLES, null, 2));
  console.log("\n" + "=" .repeat(80));
  console.log("\nOur Variables:");
  console.log(JSON.stringify(OUR_VARIABLES, null, 2));
  console.log("\n" + "=" .repeat(80));
  
  // Find differences
  console.log("\n📊 Differences:\n");
  
  const browserKeys = new Set(Object.keys(BROWSER_VARIABLES));
  const ourKeys = new Set(Object.keys(OUR_VARIABLES));
  
  // Keys in browser but not in ours
  const missingKeys = [...browserKeys].filter((key) => !ourKeys.has(key));
  if (missingKeys.length > 0) {
    console.log("❌ Missing in our implementation:");
    missingKeys.forEach((key) => {
      console.log(`   - ${key}: ${JSON.stringify(BROWSER_VARIABLES[key as keyof typeof BROWSER_VARIABLES])}`);
    });
  }
  
  // Keys in ours but not in browser
  const extraKeys = [...ourKeys].filter((key) => !browserKeys.has(key));
  if (extraKeys.length > 0) {
    console.log("\n⚠️  Extra in our implementation:");
    extraKeys.forEach((key) => {
      console.log(`   - ${key}: ${JSON.stringify(OUR_VARIABLES[key as keyof typeof OUR_VARIABLES])}`);
    });
  }
  
  // Different values
  const commonKeys = [...browserKeys].filter((key) => ourKeys.has(key));
  const differentValues = commonKeys.filter((key) => {
    const browserValue = JSON.stringify(BROWSER_VARIABLES[key as keyof typeof BROWSER_VARIABLES]);
    const ourValue = JSON.stringify(OUR_VARIABLES[key as keyof typeof OUR_VARIABLES]);
    return browserValue !== ourValue;
  });
  
  if (differentValues.length > 0) {
    console.log("\n🔄 Different values:");
    differentValues.forEach((key) => {
      console.log(`   ${key}:`);
      console.log(`     Browser: ${JSON.stringify(BROWSER_VARIABLES[key as keyof typeof BROWSER_VARIABLES])}`);
      console.log(`     Ours:    ${JSON.stringify(OUR_VARIABLES[key as keyof typeof OUR_VARIABLES])}`);
    });
  }
  
  if (missingKeys.length === 0 && extraKeys.length === 0 && differentValues.length === 0) {
    console.log("✅ Variables are identical!");
  }
};

if (import.meta.main) {
  main();
}
