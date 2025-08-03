
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type Project } from '../schema';
import { eq, and } from 'drizzle-orm';

export const updateProject = async (input: UpdateProjectInput): Promise<Project> => {
  try {
    // First verify the project exists and belongs to the user
    const existingProject = await db.select()
      .from(projectsTable)
      .where(and(
        eq(projectsTable.id, input.id),
        eq(projectsTable.user_id, input.user_id)
      ))
      .execute();

    if (existingProject.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof projectsTable.$inferInsert> = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.canvas_data !== undefined) {
      updateData.canvas_data = input.canvas_data;
    }

    if (input.is_public !== undefined) {
      updateData.is_public = input.is_public;
    }

    // Update the project
    const result = await db.update(projectsTable)
      .set(updateData)
      .where(and(
        eq(projectsTable.id, input.id),
        eq(projectsTable.user_id, input.user_id)
      ))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Project update failed:', error);
    throw error;
  }
};
