/**
 * Foodora Category GraphQL Queries
 * Queries for fetching products by category
 */

export const CATEGORY_PRODUCTS_QUERY = `
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
