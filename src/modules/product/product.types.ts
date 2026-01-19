/**
 * Store Types
 * Supported stores for product scraping
 */

export const STORE_TYPES = {
  BILLA: 'BILLA',
  FOODORA: 'FOODORA',
} as const;

export type StoreType = typeof STORE_TYPES[keyof typeof STORE_TYPES];
