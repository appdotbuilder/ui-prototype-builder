
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { componentsTable, usersTable } from '../db/schema';
import { type CreateComponentInput } from '../schema';
import { createComponent } from '../handlers/create_component';
import { eq } from 'drizzle-orm';

// Test user data
const testUserData = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: null
};

// Test component input
const testInput: CreateComponentInput = {
  user_id: 1, // Will be set after user creation
  name: 'Test Button',
  type: 'button',
  properties: '{"color": "blue", "size": "medium"}',
  is_global: false
};

describe('createComponent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a component with valid input', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUserData)
      .returning()
      .execute();

    const componentInput = { ...testInput, user_id: userResult[0].id };
    const result = await createComponent(componentInput);

    // Basic field validation
    expect(result.id).toBeDefined();
    expect(result.user_id).toEqual(userResult[0].id);
    expect(result.name).toEqual('Test Button');
    expect(result.type).toEqual('button');
    expect(result.properties).toEqual('{"color": "blue", "size": "medium"}');
    expect(result.is_global).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save component to database', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUserData)
      .returning()
      .execute();

    const componentInput = { ...testInput, user_id: userResult[0].id };
    const result = await createComponent(componentInput);

    // Query component from database
    const components = await db.select()
      .from(componentsTable)
      .where(eq(componentsTable.id, result.id))
      .execute();

    expect(components).toHaveLength(1);
    expect(components[0].name).toEqual('Test Button');
    expect(components[0].type).toEqual('button');
    expect(components[0].properties).toEqual('{"color": "blue", "size": "medium"}');
    expect(components[0].is_global).toEqual(false);
    expect(components[0].created_at).toBeInstanceOf(Date);
  });

  it('should default is_global to false when not provided', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUserData)
      .returning()
      .execute();

    const componentInput = {
      user_id: userResult[0].id,
      name: 'Test Component',
      type: 'card' as const,
      properties: '{"title": "Test Card"}'
      // is_global not provided
    };

    const result = await createComponent(componentInput);

    expect(result.is_global).toEqual(false);
  });

  it('should create global component when is_global is true', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUserData)
      .returning()
      .execute();

    const componentInput = {
      ...testInput,
      user_id: userResult[0].id,
      is_global: true
    };

    const result = await createComponent(componentInput);

    expect(result.is_global).toEqual(true);
  });

  it('should throw error for non-existent user', async () => {
    const componentInput = { ...testInput, user_id: 999 };

    await expect(createComponent(componentInput)).rejects.toThrow(/User with id 999 not found/i);
  });

  it('should throw error for invalid JSON properties', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUserData)
      .returning()
      .execute();

    const componentInput = {
      ...testInput,
      user_id: userResult[0].id,
      properties: 'invalid json string'
    };

    await expect(createComponent(componentInput)).rejects.toThrow(/Invalid JSON format/i);
  });

  it('should handle all component types', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUserData)
      .returning()
      .execute();

    const componentTypes = ['input', 'image', 'card', 'container', 'grid'] as const;

    for (const type of componentTypes) {
      const componentInput = {
        user_id: userResult[0].id,
        name: `Test ${type}`,
        type: type,
        properties: `{"type": "${type}"}`
      };

      const result = await createComponent(componentInput);

      expect(result.type).toEqual(type);
      expect(result.name).toEqual(`Test ${type}`);
    }
  });
});
