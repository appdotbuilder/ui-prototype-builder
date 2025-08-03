
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type GetProjectByIdInput, type Project } from '../schema';
import { eq, and, or } from 'drizzle-orm';

export const getProjectById = async (input: GetProjectByIdInput): Promise<Project | null> => {
  try {
    // Query for project that either belongs to the user OR is public
    const results = await db.select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, input.id),
          or(
            eq(projectsTable.user_id, input.user_id),
            eq(projectsTable.is_public, true)
          )
        )
      )
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Get project by ID failed:', error);
    throw error;
  }
};
