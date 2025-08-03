
import { db } from '../db';
import { projectsTable, usersTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Verify that the user exists first to prevent foreign key constraint violation
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (user.length === 0) {
      throw new Error(`User with id ${input.user_id} does not exist`);
    }

    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        user_id: input.user_id,
        name: input.name,
        description: input.description || null,
        canvas_data: input.canvas_data || '{}',
        is_public: input.is_public || false
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};
