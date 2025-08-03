
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUserByIdInput, type User } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserById = async (input: GetUserByIdInput): Promise<User | null> => {
  try {
    const results = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get user by ID:', error);
    throw error;
  }
};
