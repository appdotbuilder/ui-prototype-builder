
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, componentsTable } from '../db/schema';
import { type UpdateComponentInput } from '../schema';
import { updateComponent } from '../handlers/update_component';
import { eq } from 'drizzle-orm';

describe('updateComponent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: number;
  let componentId: number;
  let otherUserId: number;

  beforeEach(async () => {
    // Create test users
    const users = await db.insert(usersTable)
      .values([
        {
          email: 'test@example.com',
          name: 'Test User'
        },
        {
          email: 'other@example.com',
          name: 'Other User'
        }
      ])
      .returning()
      .execute();

    userId = users[0].id;
    otherUserId = users[1].id;

    // Create test component
    const components = await db.insert(componentsTable)
      .values({
        user_id: userId,
        name: 'Original Component',
        type: 'button',
        properties: '{"color": "blue"}',
        is_global: false
      })
      .returning()
      .execute();

    componentId = components[0].id;
  });

  it('should update component name', async () => {
    const input: UpdateComponentInput = {
      id: componentId,
      user_id: userId,
      name: 'Updated Component Name'
    };

    const result = await updateComponent(input);

    expect(result.name).toEqual('Updated Component Name');
    expect(result.id).toEqual(componentId);
    expect(result.user_id).toEqual(userId);
    expect(result.type).toEqual('button'); // Should remain unchanged
    expect(result.properties).toEqual('{"color": "blue"}'); // Should remain unchanged
    expect(result.is_global).toEqual(false); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update component type', async () => {
    const input: UpdateComponentInput = {
      id: componentId,
      user_id: userId,
      type: 'input'
    };

    const result = await updateComponent(input);

    expect(result.type).toEqual('input');
    expect(result.name).toEqual('Original Component'); // Should remain unchanged
  });

  it('should update component properties', async () => {
    const input: UpdateComponentInput = {
      id: componentId,
      user_id: userId,
      properties: '{"color": "red", "size": "large"}'
    };

    const result = await updateComponent(input);

    expect(result.properties).toEqual('{"color": "red", "size": "large"}');
    expect(result.name).toEqual('Original Component'); // Should remain unchanged
  });

  it('should update is_global flag', async () => {
    const input: UpdateComponentInput = {
      id: componentId,
      user_id: userId,
      is_global: true
    };

    const result = await updateComponent(input);

    expect(result.is_global).toEqual(true);
    expect(result.name).toEqual('Original Component'); // Should remain unchanged
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateComponentInput = {
      id: componentId,
      user_id: userId,
      name: 'Multi-Update Component',
      type: 'card',
      properties: '{"theme": "dark"}',
      is_global: true
    };

    const result = await updateComponent(input);

    expect(result.name).toEqual('Multi-Update Component');
    expect(result.type).toEqual('card');
    expect(result.properties).toEqual('{"theme": "dark"}');
    expect(result.is_global).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated component to database', async () => {
    const input: UpdateComponentInput = {
      id: componentId,
      user_id: userId,
      name: 'Database Updated Component'
    };

    await updateComponent(input);

    const components = await db.select()
      .from(componentsTable)
      .where(eq(componentsTable.id, componentId))
      .execute();

    expect(components).toHaveLength(1);
    expect(components[0].name).toEqual('Database Updated Component');
    expect(components[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when component not found', async () => {
    const input: UpdateComponentInput = {
      id: 999999, // Non-existent component ID
      user_id: userId,
      name: 'Should Fail'
    };

    expect(updateComponent(input)).rejects.toThrow(/not found or access denied/i);
  });

  it('should throw error when user does not own component', async () => {
    const input: UpdateComponentInput = {
      id: componentId,
      user_id: otherUserId, // Different user ID
      name: 'Should Fail'
    };

    expect(updateComponent(input)).rejects.toThrow(/not found or access denied/i);
  });

  it('should update updated_at timestamp', async () => {
    // Get original timestamp
    const originalComponent = await db.select()
      .from(componentsTable)
      .where(eq(componentsTable.id, componentId))
      .execute();

    const originalUpdatedAt = originalComponent[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateComponentInput = {
      id: componentId,
      user_id: userId,
      name: 'Timestamp Test'
    };

    const result = await updateComponent(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
