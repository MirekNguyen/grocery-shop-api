/**
 * Foodora API Scraper
 * Scrapes product data from Foodora's GraphQL API
 */

// Request types
interface ProductIdentifier {
  type: "ID";
  value: string;
}

interface FunWithFlag {
  key: string;
  value: string;
}

interface GraphQLVariables {
  featureFlags: FunWithFlag[];
  globalEntityId: string;
  locale: string;
  userCode: string;
  vendorCode: string;
  productIdentifier: ProductIdentifier;
  crossSellProductsComplianceLevel: number;
  crossSellProductsIsDarkstore: boolean;
  includeCrossSell: boolean;
  attributes?: string[];
}

interface ScraperConfig {
  apiUrl: string;
  headers: Record<string, string>;
  query: string;
}

// Response types
interface ProductAttribute {
  key: string;
  value: string;
}

interface ActiveCampaign {
  benefitQuantity: number;
  cartItemUsageLimit: number | null;
  description: string;
  discountType: string;
  discountValue: number;
  endTime: string;
  id: string;
  isAutoAddable: boolean;
  isBenefit: boolean;
  isTrigger: boolean;
  name: string;
  teaserFormat: string | null;
  totalTriggerThresholdFloat: number | null;
  triggerQuantity: number;
  type: string;
}

interface ProductBadge {
  text: string;
  type: string;
}

interface WeightableAttributes {
  weightedOriginalPrice: number;
  weightedPrice: number;
  weightValue: {
    unit: string;
    value: number;
  };
}

interface FoodLabellingInfo {
  labelTitle: string;
  labelValues: string[];
}

interface FoodLabelling {
  additives: FoodLabellingInfo[];
  allergens: FoodLabellingInfo[];
  nutritionFacts: FoodLabellingInfo[];
  productClaims: FoodLabellingInfo[];
  productInfos: FoodLabellingInfo[];
  warnings: FoodLabellingInfo[];
}

interface Product {
  attributes: ProductAttribute[];
  activeCampaigns: ActiveCampaign[] | null;
  badges: string[];
  description: string;
  favourite: boolean;
  globalCatalogID: string;
  isAvailable: boolean;
  name: string;
  nmrAdID: string;
  originalPrice: number;
  packagingCharge: number;
  parentID: string;
  price: number;
  productBadges: ProductBadge[] | null;
  productID: string;
  stockAmount: number;
  stockPrediction: string;
  tags: string[];
  type: string;
  urls: string[];
  vendorID: string;
  weightableAttributes: WeightableAttributes | null;
  foodLabelling?: FoodLabelling;
}

interface ShopItem {
  __typename: string;
  [key: string]: any;
}

interface ShopItemsList {
  headline: string;
  localizedHeadline: string;
  requestID: string;
  shopItemID: string;
  shopItems: ShopItem[];
  shopItemType: string;
  swimlaneFilterType: string;
  trackingID: string;
  swimlaneTrackingKey: string;
}

interface PageInfo {
  isLast: boolean;
  pageNumber: number;
}

interface Tracking {
  experimentID: string;
  experimentVariation: string;
}

interface CrossSellProducts {
  shopItemsList: ShopItemsList[];
  pageInfo: PageInfo;
  tracking: Tracking;
}

interface ProductDetails {
  crossSellProducts: CrossSellProducts;
  product: Product;
}

interface ProductDetailsResponse {
  data: {
    productDetails: ProductDetails;
  };
}

// Simplified product info for display
interface SimplifiedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number | null;
  discountPercentage: number | null;
  isAvailable: boolean;
  type: string;
  imageUrl: string | null;
  sku: string | null;
  brand: string | null;
  pricePerUnit: string | null;
  stock: string;
  campaigns: {
    name: string;
    discountValue: number;
    discountType: string;
    endTime: string;
  }[];
  allergens: string[];
  nutritionFacts: Record<string, string>;
  weight: {
    value: number;
    unit: string;
  } | null;
}

class FoodoraScraper {
  private config: ScraperConfig;

  constructor() {
    // Generate IDs first
    const perseusClientId = this.generatePerseusClientId();
    const perseusSessionId = this.generatePerseusSessionId();
    const dpsSessionId = this.generateDpsSessionId(perseusClientId);

    this.config = {
      apiUrl: "https://cz.fd-api.com/api/v5/graphql",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Referer: "https://www.foodora.cz/",
        "Content-Type": "application/json;charset=utf-8",
        "perseus-client-id": perseusClientId,
        "perseus-session-id": perseusSessionId,
        "X-PD-Language-ID": "3",
        "X-Requested-With": "XMLHttpRequest",
        "apollographql-client-name": "web",
        "apollographql-client-version": "GROCERIES-MENU-MICROFRONTEND.26.03.0016",
        platform: "web",
        "dps-session-id": dpsSessionId,
        Origin: "https://www.foodora.cz",
        "Sec-GPC": "1",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
      },
      query: `
    
    
    
    fragment ProductFields on Product {
        attributes(keys: $attributes) {
            key
            value
        }
        activeCampaigns {
            benefitQuantity
            cartItemUsageLimit
            description
            discountType
            discountValue
            endTime
            id
            isAutoAddable
            isBenefit
            isTrigger
            name
            teaserFormat
            totalTriggerThresholdFloat
            triggerQuantity
            type
        }
        badges
        description
        favourite
        globalCatalogID
        isAvailable
        name
        nmrAdID
        originalPrice
        packagingCharge
        parentID
        price
        productBadges {
            text
            type
        }
        productID
        stockAmount
        stockPrediction
        tags
        type
        urls
        vendorID
        weightableAttributes {
            weightedOriginalPrice
            weightedPrice
            weightValue {
                unit
                value
            }
        }
    }

    fragment ShopItemFields on ShopItem {
        __typename
        ...BannerFields
        ...CategoryFields
        ...ProductFields
    }

    fragment BannerFields on Banner {
        bannerUrl
        description
        globalID
        name
        nmrAdID
    }

    fragment CategoryFields on Category {
        categoryType
        name
        id
        imageUrls
        productTags
    }

    fragment ShopItemsListFields on ShopItemsList {
        headline
        localizedHeadline
        requestID
        shopItemID
        shopItems {
            ...ShopItemFields
        }
        shopItemType
        swimlaneFilterType
        trackingID
        swimlaneTrackingKey
    }

    
    fragment PageInfoFields on PageInfo {
        isLast
        pageNumber
    }


    fragment TrackingFields on Tracking {
        experimentID
        experimentVariation
    }

    fragment ShopItemsResponseFields on ShopItemsResponse {
        shopItemsList {
            ...ShopItemsListFields
        }
        pageInfo {
            ...PageInfoFields
        }
        tracking {
            ...TrackingFields
        }
    }

    
    
    fragment FoodLabellingInfoFields on FoodLabellingInfo {
        labelTitle
        labelValues
    }

    fragment FoodLabellingFields on FoodLabelling {
        additives {
            ...FoodLabellingInfoFields
        }
        allergens {
            ...FoodLabellingInfoFields
        }
        nutritionFacts {
            ...FoodLabellingInfoFields
        }
        productClaims {
            ...FoodLabellingInfoFields
        }
        productInfos {
            ...FoodLabellingInfoFields
        }
        warnings {
            ...FoodLabellingInfoFields
        }
    }

    query getProductDetails(
        $attributes: [String!]
        $featureFlags: [FunWithFlag!]
        $globalEntityId: String!
        $locale: String!
        $userCode: String
        $vendorCode: String!
        $productIdentifier: ProductIdentifier!
        $crossSellProductsComplianceLevel: Int!
        $crossSellProductsIsDarkstore: Boolean!
        $includeCrossSell: Boolean!
    ) {
        productDetails(
            input: {
                customerID: $userCode
                funWithFlags: $featureFlags
                globalEntityID: $globalEntityId
                locale: $locale
                productIdentifier: $productIdentifier
                vendorID: $vendorCode
            }
        ) {
            crossSellProducts(
                platform: "web"
                complianceLevel: $crossSellProductsComplianceLevel
                isDarkstore: $crossSellProductsIsDarkstore
            ) @include(if: $includeCrossSell) {
                ...ShopItemsResponseFields
            }
            product {
                ...ProductDetailsFields
            }
        }
    }

    fragment ProductDetailsFields on Product {
        ...ProductFields
        foodLabelling {
            ...FoodLabellingFields
        }
    }
`,
    };
  }

  private generatePerseusClientId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString().substring(2);
    const suffix = Math.random().toString(36).substring(2, 12);
    return `${timestamp}.${random}.${suffix}`;
  }

  private generatePerseusSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString().substring(2);
    const suffix = Math.random().toString(36).substring(2, 12);
    return `${timestamp}.${random}.${suffix}`;
  }

  private generateDpsSessionId(perseusClientId: string): string {
    const sessionId = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const timestamp = Math.floor(Date.now() / 1000);

    const payload = {
      session_id: sessionId,
      perseus_id: perseusClientId,
      timestamp: timestamp,
    };

    return btoa(JSON.stringify(payload));
  }

  async getProductDetails(
    productId: string,
    vendorCode: string = "o7b0",
    userCode: string = "cz6a15cx"
  ): Promise<ProductDetailsResponse> {
    const variables: GraphQLVariables = {
      featureFlags: [
        {
          key: "pd-qc-weight-stepper",
          value: "Variation1",
        },
      ],
      globalEntityId: "DJ_CZ",
      locale: "cs_CZ",
      userCode: userCode,
      vendorCode: vendorCode,
      productIdentifier: {
        type: "ID",
        value: productId,
      },
      crossSellProductsComplianceLevel: 7,
      crossSellProductsIsDarkstore: false,
      includeCrossSell: true,
    };

    const response = await fetch(this.config.apiUrl, {
      method: "POST",
      headers: this.config.headers,
      body: JSON.stringify({
        query: this.config.query,
        variables: variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as ProductDetailsResponse;
  }

  // Extract simplified product information
  simplifyProduct(product: Product): SimplifiedProduct {
    // Get SKU from attributes
    const skuAttr = product.attributes.find((attr) => attr.key === "sku");
    const brandAttr = product.attributes.find((attr) => attr.key === "brand");
    const pricePerUnitAttr = product.attributes.find(
      (attr) => attr.key === "pricePerBaseUnit"
    );
    const baseUnitAttr = product.attributes.find(
      (attr) => attr.key === "baseUnit"
    );

    // Calculate discount
    const discount =
      product.originalPrice > product.price
        ? product.originalPrice - product.price
        : null;
    const discountPercentage = discount
      ? Math.round((discount / product.originalPrice) * 100)
      : null;

    // Extract campaigns
    const campaigns =
      product.activeCampaigns?.map((campaign) => ({
        name: campaign.name,
        discountValue: campaign.discountValue,
        discountType: campaign.discountType,
        endTime: campaign.endTime,
      })) || [];

    // Extract allergens
    const allergens =
      product.foodLabelling?.allergens?.flatMap((a) => a.labelValues) || [];

    // Extract nutrition facts as key-value pairs
    const nutritionFacts: Record<string, string> = {};
    if (product.foodLabelling?.nutritionFacts) {
      product.foodLabelling.nutritionFacts.forEach((fact) => {
        nutritionFacts[fact.labelTitle] = fact.labelValues.join(", ");
      });
    }

    // Get weight info
    const weight = product.weightableAttributes
      ? {
          value: product.weightableAttributes.weightValue.value,
          unit: product.weightableAttributes.weightValue.unit,
        }
      : null;

    // Stock status
    let stock = "Unknown";
    if (product.isAvailable) {
      stock =
        product.stockAmount > 0 ? `${product.stockAmount} units` : "In Stock";
    } else {
      stock = "Out of Stock";
    }

    return {
      id: product.productID,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discount,
      discountPercentage,
      isAvailable: product.isAvailable,
      type: product.type,
      imageUrl: product.urls[0] || null,
      sku: skuAttr?.value || null,
      brand: brandAttr?.value || null,
      pricePerUnit:
        pricePerUnitAttr && baseUnitAttr
          ? `${pricePerUnitAttr.value} Kč/${baseUnitAttr.value}`
          : null,
      stock,
      campaigns,
      allergens,
      nutritionFacts,
      weight,
    };
  }

  // Display simplified product in a nice format
  displayProduct(simplified: SimplifiedProduct): void {
    console.log("\n" + "=".repeat(80));
    console.log(`📦 ${simplified.name}`);
    console.log("=".repeat(80));

    // Price info
    if (simplified.discount) {
      console.log(
        `💰 Price: ${simplified.price} Kč (was ${simplified.originalPrice} Kč) - ${simplified.discountPercentage}% OFF`
      );
      console.log(`   Savings: ${simplified.discount.toFixed(2)} Kč`);
    } else {
      console.log(`💰 Price: ${simplified.price} Kč`);
    }

    if (simplified.pricePerUnit) {
      console.log(`   Price per unit: ${simplified.pricePerUnit}`);
    }

    // Basic info
    console.log(`\n📋 Product ID: ${simplified.id}`);
    if (simplified.sku) console.log(`   SKU: ${simplified.sku}`);
    if (simplified.brand) console.log(`   Brand: ${simplified.brand}`);
    console.log(`   Type: ${simplified.type}`);
    console.log(`   Stock: ${simplified.stock}`);
    console.log(
      `   Available: ${simplified.isAvailable ? "✅ Yes" : "❌ No"}`
    );

    // Weight info
    if (simplified.weight) {
      console.log(
        `   Weight: ${simplified.weight.value} ${simplified.weight.unit}`
      );
    }

    // Description
    if (simplified.description) {
      console.log(`\n📝 Description:`);
      console.log(`   ${simplified.description.replace(/\n/g, "\n   ")}`);
    }

    // Active campaigns
    if (simplified.campaigns.length > 0) {
      console.log(`\n🎉 Active Campaigns:`);
      simplified.campaigns.forEach((campaign) => {
        console.log(`   • ${campaign.name}`);
        console.log(
          `     Discount: ${campaign.discountValue} Kč (${campaign.discountType})`
        );
        console.log(`     Valid until: ${campaign.endTime}`);
      });
    }

    // Allergens
    if (simplified.allergens.length > 0) {
      console.log(`\n⚠️  Allergens:`);
      console.log(`   ${simplified.allergens.join(", ")}`);
    }

    // Nutrition facts
    if (Object.keys(simplified.nutritionFacts).length > 0) {
      console.log(`\n🥗 Nutrition Facts:`);
      Object.entries(simplified.nutritionFacts).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }

    // Image
    if (simplified.imageUrl) {
      console.log(`\n🖼️  Image: ${simplified.imageUrl}`);
    }

    console.log("=".repeat(80) + "\n");
  }

  async getCategoryProducts(
    categoryId: string,
    vendorCode: string = "o7b0"
  ): Promise<any> {
    // This would require a different query - placeholder for now
    console.log("Category scraping not yet implemented");
    return null;
  }

  // Helper method to save data to file
  async saveToFile(data: any, filename: string): Promise<void> {
    await Bun.write(filename, JSON.stringify(data, null, 2));
    console.log(`💾 Full data saved to ${filename}`);
  }

  // Save simplified data
  async saveSimplified(
    simplified: SimplifiedProduct,
    filename: string
  ): Promise<void> {
    await Bun.write(filename, JSON.stringify(simplified, null, 2));
    console.log(`💾 Simplified data saved to ${filename}`);
  }
}

// Example usage
async function main() {
  const scraper = new FoodoraScraper();

  try {
    console.log("Fetching product details...");
    const productData = await scraper.getProductDetails("119547085");

    const product = productData.data.productDetails.product;

    // Simplify and display
    const simplified = scraper.simplifyProduct(product);
    scraper.displayProduct(simplified);

    // Save both full and simplified data
    await scraper.saveToFile(productData, "product-119547085-full.json");
    await scraper.saveSimplified(simplified, "product-119547085-simple.json");
  } catch (error) {
    console.error("Error scraping data:", error);
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  main();
}

export { FoodoraScraper };

