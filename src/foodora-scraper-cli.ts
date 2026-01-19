/**
 * Foodora Scraper CLI
 * Example usage and demonstration of the Foodora scraper module
 */

import { scrapeProductFull, saveToFile } from "./modules/foodora-scraper/index.ts";
import type { SimplifiedProduct } from "./modules/foodora-scraper/index.ts";

// ============================================================================
// Display Functions
// ============================================================================

/**
 * Displays simplified product information in the console
 */
const displayProduct = (simplified: SimplifiedProduct): void => {
  console.log("\n✅ Product scraped successfully!\n");

  // Basic Information
  console.log("📦 PRODUCT INFORMATION");
  console.log("-".repeat(80));
  console.log(`Name:        ${simplified.name}`);
  console.log(`ID:          ${simplified.id}`);
  console.log(`Type:        ${simplified.type}`);
  if (simplified.sku) console.log(`SKU:         ${simplified.sku}`);
  if (simplified.brand) console.log(`Brand:       ${simplified.brand}`);
  console.log(`Available:   ${simplified.isAvailable ? "✅ Yes" : "❌ No"}`);
  console.log(`Stock:       ${simplified.stock}`);

  // Price Information
  console.log(`\n💰 PRICING`);
  console.log("-".repeat(80));
  console.log(`Current Price:    ${simplified.price} Kč`);
  console.log(`Original Price:   ${simplified.originalPrice} Kč`);
  if (simplified.discount) {
    console.log(`Discount:         ${simplified.discount.toFixed(2)} Kč (${simplified.discountPercentage}% OFF)`);
  }
  if (simplified.pricePerUnit) {
    console.log(`Price per Unit:   ${simplified.pricePerUnit}`);
  }

  // Weight Information
  if (simplified.weight) {
    console.log(`\n⚖️  WEIGHT`);
    console.log("-".repeat(80));
    console.log(`${simplified.weight.value} ${simplified.weight.unit}`);
  }

  // Description
  if (simplified.description) {
    console.log(`\n📝 DESCRIPTION`);
    console.log("-".repeat(80));
    console.log(simplified.description);
  }

  // Active Campaigns
  if (simplified.campaigns.length > 0) {
    console.log(`\n🎉 ACTIVE CAMPAIGNS (${simplified.campaigns.length})`);
    console.log("-".repeat(80));
    simplified.campaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   Discount: ${campaign.discountValue} Kč (${campaign.discountType})`);
      console.log(`   Valid until: ${campaign.endTime}`);
    });
  }

  // Allergens
  if (simplified.allergens.length > 0) {
    console.log(`\n⚠️  ALLERGENS (${simplified.allergens.length})`);
    console.log("-".repeat(80));
    console.log(simplified.allergens.join(", "));
  }

  // Nutrition Facts
  if (Object.keys(simplified.nutritionFacts).length > 0) {
    console.log(`\n🥗 NUTRITION FACTS`);
    console.log("-".repeat(80));
    Object.entries(simplified.nutritionFacts).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  }

  // Image URL
  if (simplified.imageUrl) {
    console.log(`\n🖼️  IMAGE`);
    console.log("-".repeat(80));
    console.log(simplified.imageUrl);
  }
};

// ============================================================================
// Main Function
// ============================================================================

const main = async (): Promise<void> => {
  try {
    console.log("=".repeat(80));
    console.log("Fetching product details from Foodora API...");
    console.log("=".repeat(80));

    const { full, simplified } = await scrapeProductFull("119547085");

    displayProduct(simplified);

    // Save both full and simplified data
    console.log(`\n💾 SAVING FILES`);
    console.log("-".repeat(80));
    await saveToFile(full, "output/product-119547085-full.json");
    console.log("✅ Full data saved to: output/product-119547085-full.json");

    await saveToFile(simplified, "output/product-119547085-simple.json");
    console.log("✅ Simplified data saved to: output/product-119547085-simple.json");

    console.log("\n" + "=".repeat(80));
    console.log("✨ Scraping completed successfully!");
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("\n❌ Error scraping data:");
    console.error("-".repeat(80));
    console.error(error);
    console.error("-".repeat(80) + "\n");
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.main) {
  main();
}
