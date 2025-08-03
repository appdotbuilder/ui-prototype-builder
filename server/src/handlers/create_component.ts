
import { db } from '../db';
import { componentsTable, usersTable } from '../db/schema';
import { type CreateComponentInput, type Component } from '../schema';
import { eq } from 'drizzle-orm';

export const createComponent = async (input: CreateComponentInput): Promise<Component> => {
  try {
    // Validate that the user exists
    const existingUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (existingUser.length === 0) {
      throw new Error(`User with id ${input.user_id} not found`);
    }

    // Validate that properties is valid JSON
    try {
      JSON.parse(input.properties);
    } catch (error) {
      throw new Error('Invalid JSON format for component properties');
    }

    // Insert component record
    const result = await db.insert(componentsTable)
      .values({
        user_id: input.user_id,
        name: input.name,
        type: input.type,
        properties: input.properties,
        is_global: input.is_global || false
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Component creation failed:', error);
    throw error;
  }
};
