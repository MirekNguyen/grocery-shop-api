/**
 * Foodora API Constants
 * Configuration values and static data
 */

// ============================================================================
// API Configuration
// ============================================================================

export const FOODORA_API_URL = "https://cz.fd-api.com/api/v5/graphql";
export const DEFAULT_VENDOR_CODE = "o7b0";
export const DEFAULT_USER_CODE = "cz6a15cx";
export const DEFAULT_GLOBAL_ENTITY_ID = "DJ_CZ";
export const DEFAULT_LOCALE = "cs_CZ";

// ============================================================================
// Feature Flags
// ============================================================================

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
