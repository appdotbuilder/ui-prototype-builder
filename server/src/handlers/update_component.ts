
import { db } from '../db';
import { componentsTable } from '../db/schema';
import { type UpdateComponentInput, type Component } from '../schema';
import { eq, and } from 'drizzle-orm';

export const updateComponent = async (input: UpdateComponentInput): Promise<Component> => {
  try {
    // Build the update data object with only provided fields
    const updateData: Partial<typeof componentsTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.type !== undefined) {
      updateData.type = input.type;
    }

    if (input.properties !== undefined) {
      updateData.properties = input.properties;
    }

    if (input.is_global !== undefined) {
      updateData.is_global = input.is_global;
    }

    // Update component record (only if user owns it)
    const result = await db.update(componentsTable)
      .set(updateData)
      .where(and(
        eq(componentsTable.id, input.id),
        eq(componentsTable.user_id, input.user_id)
      ))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Component not found or access denied');
    }

    return result[0];
  } catch (error) {
    console.error('Component update failed:', error);
    throw error;
  }
};
