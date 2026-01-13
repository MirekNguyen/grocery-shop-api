/**
 * Full-Text Search repository for products using SQLite FTS5
 * Handles advanced search with diacritics support, multi-language, and fuzzy matching
 */

import { sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { products } from './product.schema';

/**
 * Search products using FTS5 full-text search
 * Supports:
 * - Diacritics removal (müller finds Müller)
 * - Prefix matching (bana finds Banán)
 * - Multi-word queries
 * - Ranking by relevance
 */
export const searchProducts = async (
  query: string,
  limit: number = 100
): Promise<number[]> => {
  if (!query || query.trim() === '') {
    return [];
  }

  // Prepare query for FTS5: add prefix matching with *
  const ftsQuery = query
    .trim()
    .split(/\s+/)
    .map(term => `${term}*`)
    .join(' ');

  try {
    // Use FTS5 MATCH with ranking
    const results = await db.all<{ id: number; rank: number }>(sql`
      SELECT 
        p.id,
        products_fts.rank
      FROM products_fts
      JOIN products p ON products_fts.rowid = p.id
      WHERE products_fts MATCH ${ftsQuery}
      ORDER BY products_fts.rank
      LIMIT ${limit}
    `);

    return results.map(r => r.id);
  } catch (error) {
    console.error('FTS search error:', error);
    // Fallback to empty results if FTS fails
    return [];
  }
};

/**
 * Search products with highlighted snippets
 * Returns product IDs with search result snippets for display
 */
export const searchProductsWithSnippets = async (
  query: string,
  limit: number = 100
): Promise<Array<{ id: number; snippet: string; rank: number }>> => {
  if (!query || query.trim() === '') {
    return [];
  }

  const ftsQuery = query
    .trim()
    .split(/\s+/)
    .map(term => `${term}*`)
    .join(' ');

  try {
    const results = await db.all<{ id: number; snippet: string; rank: number }>(sql`
      SELECT 
        p.id,
        snippet(products_fts, 1, '<mark>', '</mark>', '...', 32) as snippet,
        products_fts.rank
      FROM products_fts
      JOIN products p ON products_fts.rowid = p.id
      WHERE products_fts MATCH ${ftsQuery}
      ORDER BY products_fts.rank
      LIMIT ${limit}
    `);

    return results;
  } catch (error) {
    console.error('FTS search with snippets error:', error);
    return [];
  }
};
