import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { categories, type Category, type NewCategory } from './category.schema';

/**
 * Inserts a new category into the database.
 */
export const createCategory = async (data: NewCategory): Promise<Category> => {
  const [result] = await db.insert(categories).values(data).returning();
  return result;
};

/**
 * Finds a category by its key.
 */
export const findCategoryByKey = async (key: string): Promise<Category | undefined> => {
  return await db.query.categories.findFirst({
    where: eq(categories.key, key),
  });
};

/**
 * Finds a category by its slug.
 */
export const findCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
  return await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
};

/**
 * Gets all categories.
 */
export const findAllCategories = async (): Promise<Category[]> => {
  return await db.select().from(categories).orderBy(categories.name);
};

/**
 * Gets all categories.
 */
export const getAllCategories = async (): Promise<Category[]> => {
  return await db.select().from(categories).orderBy(categories.orderHint);
};

/**
 * Gets all root categories (categories without a parent).
 */
export const getRootCategories = async (): Promise<Category[]> => {
  return await db.query.categories.findMany({
    where: sql`${categories.parentId} IS NULL`,
    orderBy: categories.orderHint,
  });
};

/**
 * Gets child categories by parent ID.
 */
export const getChildCategories = async (parentId: number): Promise<Category[]> => {
  return await db.query.categories.findMany({
    where: eq(categories.parentId, parentId),
    orderBy: categories.orderHint,
  });
};

/**
 * Gets a category with its children.
 */
export const getCategoryWithChildren = async (id: number): Promise<(Category & { children: Category[] }) | null> => {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
  
  if (!category) {
    return null;
  }
  
  const children = await getChildCategories(id);
  
  return {
    ...category,
    children,
  };
};

/**
 * Updates a category or inserts if it doesn't exist (upsert by key).
 */
export const upsertCategory = async (data: NewCategory): Promise<Category> => {
  const existing = await findCategoryByKey(data.key as string);
  
  if (existing) {
    const [updated] = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.key, data.key as string))
      .returning();
    return updated;
  } else {
    return await createCategory(data);
  }
};

/**
 * Gets total count of categories in database.
 */
export const getCategoryCount = async (): Promise<number> => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(categories);
  return result[0].count;
};

/**
 * Gets all descendant category keys for a given category (including the category itself).
 * This is used to query products that belong to a category or any of its subcategories.
 */
export const getAllDescendantCategoryKeys = async (categoryKey: string): Promise<string[]> => {
  const category = await findCategoryByKey(categoryKey);
  
  if (!category) {
    return [];
  }
  
  const keys: string[] = [categoryKey];
  
  const getChildrenKeys = async (parentId: number): Promise<void> => {
    const children = await getChildCategories(parentId);
    
    for (const child of children) {
      keys.push(child.key);
      // Recursively get children of children
      await getChildrenKeys(child.id);
    }
  };
  
  await getChildrenKeys(category.id);
  
  return keys;
};

/**
 * Gets all descendant category slugs for a given category slug (including the category itself).
 * This is used to query products that belong to a category or any of its subcategories.
 */
export const getAllDescendantCategorySlugs = async (categorySlug: string): Promise<string[]> => {
  const category = await findCategoryBySlug(categorySlug);
  
  if (!category) {
    return [];
  }
  
  const slugs: string[] = [categorySlug];
  
  const getChildrenSlugs = async (parentId: number): Promise<void> => {
    const children = await getChildCategories(parentId);
    
    for (const child of children) {
      slugs.push(child.slug);
      // Recursively get children of children
      await getChildrenSlugs(child.id);
    }
  };
  
  await getChildrenSlugs(category.id);
  
  return slugs;
};
