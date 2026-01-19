/**
 * Foodora API Constants
 */

export const FOODORA_API_URL = "https://cz.fd-api.com/api/v5/graphql";

// Vendor codes for different Foodora stores
export const FOODORA_VENDORS = {
  BILLA_PROSEK: "mjul",      // BILLA - Praha Prosek
  ALBERT_FLORENC: "obc6",    // Albert Praha Florenc
  DMART: "o7b0",             // D-Mart (original default)
} as const;

export type FoodoraVendorCode = typeof FOODORA_VENDORS[keyof typeof FOODORA_VENDORS];

// Default vendor code (D-Mart)
export const DEFAULT_VENDOR_CODE = FOODORA_VENDORS.DMART;

// Default user code (seems to be consistent across vendors)
export const DEFAULT_USER_CODE = "cz6a15cx";

// Default global entity ID for Czech Republic
export const DEFAULT_GLOBAL_ENTITY_ID = "DJ_CZ";

// Default locale
export const DEFAULT_LOCALE = "cs_CZ";

// Default feature flags
export const DEFAULT_FEATURE_FLAGS = [
  {
    key: "pd-qc-weight-stepper",
    value: "Variation1",
  },
];

// ============================================================================
// Request Configuration
// ============================================================================

export const DEFAULT_CROSS_SELL_COMPLIANCE_LEVEL = 7;
export const DEFAULT_CROSS_SELL_IS_DARKSTORE = false;
export const DEFAULT_INCLUDE_CROSS_SELL = true;
