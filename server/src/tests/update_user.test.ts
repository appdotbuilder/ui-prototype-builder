
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

// Test inputs
const testUserInput: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123'
};

// Helper function to create user directly in database for testing
const createTestUser = async (input: CreateUserInput) => {
  const result = await db.insert(usersTable)
    .values({
      email: input.email,
      name: input.name,
      google_id: input.google_id
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update user email', async () => {
    // Create user first
    const createdUser = await createTestUser(testUserInput);

    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      email: 'updated@example.com'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(createdUser.id);
    expect(result.email).toEqual('updated@example.com');
    expect(result.name).toEqual('Test User'); // Should remain unchanged
    expect(result.google_id).toEqual('google123'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdUser.updated_at).toBe(true);
  });

  it('should update user name', async () => {
    const createdUser = await createTestUser(testUserInput);

    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      name: 'Updated Name'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(createdUser.id);
    expect(result.email).toEqual('test@example.com'); // Should remain unchanged
    expect(result.name).toEqual('Updated Name');
    expect(result.google_id).toEqual('google123'); // Should remain unchanged
  });

  it('should update google_id to null', async () => {
    const createdUser = await createTestUser(testUserInput);

    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      google_id: null
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(createdUser.id);
    expect(result.email).toEqual('test@example.com'); // Should remain unchanged
    expect(result.name).toEqual('Test User'); // Should remain unchanged
    expect(result.google_id).toBeNull();
  });

  it('should update multiple fields at once', async () => {
    const createdUser = await createTestUser(testUserInput);

    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      email: 'multi@example.com',
      name: 'Multi Update User',
      google_id: 'newgoogle456'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(createdUser.id);
    expect(result.email).toEqual('multi@example.com');
    expect(result.name).toEqual('Multi Update User');
    expect(result.google_id).toEqual('newgoogle456');
    expect(result.updated_at > createdUser.updated_at).toBe(true);
  });

  it('should save updated user to database', async () => {
    const createdUser = await createTestUser(testUserInput);

    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      email: 'db@example.com',
      name: 'DB Test User'
    };

    const result = await updateUser(updateInput);

    // Verify in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('db@example.com');
    expect(users[0].name).toEqual('DB Test User');
    expect(users[0].google_id).toEqual('google123'); // Unchanged
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent user', async () => {
    const updateInput: UpdateUserInput = {
      id: 999999, // Non-existent ID
      email: 'nonexistent@example.com'
    };

    await expect(updateUser(updateInput)).rejects.toThrow(/user with id 999999 not found/i);
  });

  it('should update only updated_at when no other fields provided', async () => {
    const createdUser = await createTestUser(testUserInput);

    const updateInput: UpdateUserInput = {
      id: createdUser.id
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(createdUser.id);
    expect(result.email).toEqual(createdUser.email);
    expect(result.name).toEqual(createdUser.name);
    expect(result.google_id).toEqual(createdUser.google_id);
    expect(result.updated_at > createdUser.updated_at).toBe(true);
  });
});
