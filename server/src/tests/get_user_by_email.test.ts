
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUserByEmailInput, type CreateUserInput } from '../schema';
import { getUserByEmail } from '../handlers/get_user_by_email';

// Test input
const testInput: GetUserByEmailInput = {
  email: 'test@example.com'
};

// User data for testing
const testUserData: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: null
};

describe('getUserByEmail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user when email exists', async () => {
    // Create a test user first
    await db.insert(usersTable)
      .values({
        email: testUserData.email,
        name: testUserData.name,
        google_id: testUserData.google_id
      })
      .execute();

    const result = await getUserByEmail(testInput);

    expect(result).not.toBeNull();
    expect(result!.email).toEqual('test@example.com');
    expect(result!.name).toEqual('Test User');
    expect(result!.google_id).toBeNull();
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when email does not exist', async () => {
    const result = await getUserByEmail({
      email: 'nonexistent@example.com'
    });

    expect(result).toBeNull();
  });

  it('should handle different email formats correctly', async () => {
    // Create users with different email formats
    const emails = [
      'user.with.dots@example.com',
      'user+tag@example.com',
      'UPPERCASE@EXAMPLE.COM'
    ];

    for (const email of emails) {
      await db.insert(usersTable)
        .values({
          email: email,
          name: 'Test User',
          google_id: null
        })
        .execute();
    }

    // Test each email can be found
    for (const email of emails) {
      const result = await getUserByEmail({ email });
      expect(result).not.toBeNull();
      expect(result!.email).toEqual(email);
    }
  });

  it('should return user with google_id when present', async () => {
    // Create user with google_id
    await db.insert(usersTable)
      .values({
        email: 'google@example.com',
        name: 'Google User',
        google_id: 'google123'
      })
      .execute();

    const result = await getUserByEmail({
      email: 'google@example.com'
    });

    expect(result).not.toBeNull();
    expect(result!.email).toEqual('google@example.com');
    expect(result!.name).toEqual('Google User');
    expect(result!.google_id).toEqual('google123');
  });
});
