
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type GetProjectsByUserIdInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const getProjectsByUserId = async (input: GetProjectsByUserIdInput): Promise<Project[]> => {
  try {
    const results = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.user_id, input.user_id))
      .execute();

    // Return the results as-is since all fields are already in correct format
    return results;
  } catch (error) {
    console.error('Failed to get projects by user ID:', error);
    throw error;
  }
};
