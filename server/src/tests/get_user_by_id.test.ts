
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUserByIdInput } from '../schema';
import { getUserById } from '../handlers/get_user_by_id';

describe('getUserById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user when found', async () => {
    // Create test user
    const testUser = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .returning()
      .execute();

    const input: GetUserByIdInput = {
      id: testUser[0].id
    };

    const result = await getUserById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testUser[0].id);
    expect(result!.email).toEqual('test@example.com');
    expect(result!.name).toEqual('Test User');
    expect(result!.google_id).toEqual('google123');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when user not found', async () => {
    const input: GetUserByIdInput = {
      id: 999999 // Non-existent ID
    };

    const result = await getUserById(input);

    expect(result).toBeNull();
  });

  it('should return user with null google_id', async () => {
    // Create test user without google_id
    const testUser = await db.insert(usersTable)
      .values({
        email: 'nogoogle@example.com',
        name: 'No Google User',
        google_id: null
      })
      .returning()
      .execute();

    const input: GetUserByIdInput = {
      id: testUser[0].id
    };

    const result = await getUserById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testUser[0].id);
    expect(result!.email).toEqual('nogoogle@example.com');
    expect(result!.name).toEqual('No Google User');
    expect(result!.google_id).toBeNull();
  });
});
