
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.name).toEqual('Test User');
    expect(result.google_id).toEqual('google123');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query using proper drizzle syntax
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].name).toEqual('Test User');
    expect(users[0].google_id).toEqual('google123');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null google_id', async () => {
    const inputWithoutGoogleId: CreateUserInput = {
      email: 'test2@example.com',
      name: 'Test User 2'
    };

    const result = await createUser(inputWithoutGoogleId);

    expect(result.email).toEqual('test2@example.com');
    expect(result.name).toEqual('Test User 2');
    expect(result.google_id).toBeNull();
  });

  it('should throw error for duplicate email', async () => {
    // Create first user
    await createUser(testInput);

    // Try to create user with same email
    const duplicateInput: CreateUserInput = {
      email: 'test@example.com',
      name: 'Another User',
      google_id: 'google456'
    };

    expect(createUser(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });

  it('should handle undefined google_id as null', async () => {
    const inputWithUndefinedGoogleId: CreateUserInput = {
      email: 'test3@example.com',
      name: 'Test User 3',
      google_id: undefined
    };

    const result = await createUser(inputWithUndefinedGoogleId);

    expect(result.google_id).toBeNull();
    
    // Verify in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users[0].google_id).toBeNull();
  });
});
