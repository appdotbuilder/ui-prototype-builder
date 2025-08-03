
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type DeleteProjectInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export const deleteProject = async (input: DeleteProjectInput): Promise<{ success: boolean }> => {
  try {
    // Delete project - using both id and user_id ensures authorization
    const result = await db.delete(projectsTable)
      .where(and(
        eq(projectsTable.id, input.id),
        eq(projectsTable.user_id, input.user_id)
      ))
      .returning()
      .execute();

    // If no rows were affected, the project either doesn't exist or user doesn't own it
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw error;
  }
};
