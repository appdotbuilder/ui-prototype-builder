
import { db } from '../db';
import { componentsTable } from '../db/schema';
import { type DeleteComponentInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export const deleteComponent = async (input: DeleteComponentInput): Promise<{ success: boolean }> => {
  try {
    // Delete component only if it belongs to the user
    const result = await db.delete(componentsTable)
      .where(
        and(
          eq(componentsTable.id, input.id),
          eq(componentsTable.user_id, input.user_id)
        )
      )
      .execute();

    // Check if any rows were affected (component existed and was owned by user)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Component deletion failed:', error);
    throw error;
  }
};
