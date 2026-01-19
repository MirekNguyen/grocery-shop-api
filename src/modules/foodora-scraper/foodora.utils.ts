/**
 * Foodora API Utility Functions
 * ID generation and configuration helpers
 */

import type { ScraperHeaders } from "./foodora.types.ts";

// ============================================================================
// ID Generation Functions
// ============================================================================

/**
 * Generates a Perseus client ID for API authentication
 * Format: timestamp.random.suffix
 */
export const generatePerseusClientId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString().substring(2);
  const suffix = Math.random().toString(36).substring(2, 12);
  return `${timestamp}.${random}.${suffix}`;
};

/**
 * Generates a Perseus session ID for API authentication
 * Format: timestamp.random.suffix
 */
export const generatePerseusSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString().substring(2);
  const suffix = Math.random().toString(36).substring(2, 12);
  return `${timestamp}.${random}.${suffix}`;
};

/**
 * Generates a DPS session ID for API authentication
 * Encodes session information as base64 JSON
 */
export const generateDpsSessionId = (perseusClientId: string): string => {
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
};

// ============================================================================
// Header Generation
// ============================================================================

/**
 * Creates HTTP headers for Foodora API requests
 * Includes authentication tokens and browser identification
 */
export const createScraperHeaders = (
  perseusClientId: string,
  perseusSessionId: string,
  dpsSessionId: string
): ScraperHeaders => {
  return {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0",
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
    "dps-session-id": dpsSessionId,
    "Origin": "https://www.foodora.cz",
    "Sec-GPC": "1",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
  };
};
