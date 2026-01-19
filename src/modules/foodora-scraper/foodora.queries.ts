/**
 * Foodora GraphQL Query
 * Complete query for fetching product details with fragments
 */

export const PRODUCT_DETAILS_QUERY = `
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
`;
