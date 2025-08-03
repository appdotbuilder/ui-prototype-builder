
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, componentsTable } from '../db/schema';
import { type CreateUserInput, type CreateComponentInput } from '../schema';
import { getGlobalComponents } from '../handlers/get_global_components';

describe('getGlobalComponents', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no global components exist', async () => {
    const result = await getGlobalComponents();
    expect(result).toEqual([]);
  });

  it('should return only global components', async () => {
    // Create a test user first
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create a global component
    await db.insert(componentsTable)
      .values({
        user_id: userId,
        name: 'Global Button',
        type: 'button',
        properties: '{"color": "blue", "size": "medium"}',
        is_global: true
      })
      .execute();

    // Create a non-global component
    await db.insert(componentsTable)
      .values({
        user_id: userId,
        name: 'Private Button',
        type: 'button',
        properties: '{"color": "red", "size": "large"}',
        is_global: false
      })
      .execute();

    const result = await getGlobalComponents();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Global Button');
    expect(result[0].type).toEqual('button');
    expect(result[0].properties).toEqual('{"color": "blue", "size": "medium"}');
    expect(result[0].is_global).toBe(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple global components', async () => {
    // Create a test user first
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create multiple global components
    await db.insert(componentsTable)
      .values([
        {
          user_id: userId,
          name: 'Global Button',
          type: 'button',
          properties: '{"color": "blue"}',
          is_global: true
        },
        {
          user_id: userId,
          name: 'Global Input',
          type: 'input',
          properties: '{"placeholder": "Enter text"}',
          is_global: true
        },
        {
          user_id: userId,
          name: 'Global Card',
          type: 'card',
          properties: '{"shadow": true}',
          is_global: true
        }
      ])
      .execute();

    const result = await getGlobalComponents();

    expect(result).toHaveLength(3);
    
    const componentNames = result.map(c => c.name).sort();
    expect(componentNames).toEqual(['Global Button', 'Global Card', 'Global Input']);
    
    // Verify all are global
    result.forEach(component => {
      expect(component.is_global).toBe(true);
      expect(component.id).toBeDefined();
      expect(component.user_id).toEqual(userId);
      expect(component.created_at).toBeInstanceOf(Date);
      expect(component.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return global components from different users', async () => {
    // Create two test users
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        name: 'User One'
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        name: 'User Two'
      })
      .returning()
      .execute();
    
    const userId1 = user1Result[0].id;
    const userId2 = user2Result[0].id;

    // Create global components from both users
    await db.insert(componentsTable)
      .values([
        {
          user_id: userId1,
          name: 'User1 Global Button',
          type: 'button',
          properties: '{"color": "blue"}',
          is_global: true
        },
        {
          user_id: userId2,
          name: 'User2 Global Input',
          type: 'input',
          properties: '{"placeholder": "test"}',
          is_global: true
        }
      ])
      .execute();

    const result = await getGlobalComponents();

    expect(result).toHaveLength(2);
    
    // Both components should be returned regardless of which user created them
    const userIds = result.map(c => c.user_id).sort();
    expect(userIds).toEqual([userId1, userId2].sort());
    
    result.forEach(component => {
      expect(component.is_global).toBe(true);
    });
  });
});
