
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUserByEmailInput, type User } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserByEmail = async (input: GetUserByEmailInput): Promise<User | null> => {
  try {
    const result = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Get user by email failed:', error);
    throw error;
  }
};
