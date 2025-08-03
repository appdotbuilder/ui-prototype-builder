
import { db } from '../db';
import { componentsTable } from '../db/schema';
import { type GetComponentsByUserIdInput, type Component } from '../schema';
import { eq, or } from 'drizzle-orm';

export const getComponentsByUserId = async (input: GetComponentsByUserIdInput): Promise<Component[]> => {
  try {
    // Query components that either belong to the user OR are global components
    const results = await db.select()
      .from(componentsTable)
      .where(
        or(
          eq(componentsTable.user_id, input.user_id),
          eq(componentsTable.is_global, true)
        )
      )
      .execute();

    // Return results as-is since all fields are already the correct types
    return results;
  } catch (error) {
    console.error('Failed to get components by user ID:', error);
    throw error;
  }
};
