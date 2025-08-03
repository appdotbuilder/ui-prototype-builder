
import { db } from '../db';
import { componentsTable } from '../db/schema';
import { type Component } from '../schema';
import { eq } from 'drizzle-orm';

export const getGlobalComponents = async (): Promise<Component[]> => {
  try {
    const results = await db.select()
      .from(componentsTable)
      .where(eq(componentsTable.is_global, true))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch global components:', error);
    throw error;
  }
};
