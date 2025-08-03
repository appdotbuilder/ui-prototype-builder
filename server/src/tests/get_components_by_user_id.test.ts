
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, componentsTable } from '../db/schema';
import { type GetComponentsByUserIdInput, type CreateUserInput, type CreateComponentInput } from '../schema';
import { getComponentsByUserId } from '../handlers/get_components_by_user_id';

// Test user inputs
const testUser1: CreateUserInput = {
  email: 'user1@test.com',
  name: 'Test User 1'
};

const testUser2: CreateUserInput = {
  email: 'user2@test.com',
  name: 'Test User 2'
};

describe('getComponentsByUserId', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user-specific components', async () => {
    // Create test users
    const user1Result = await db.insert(usersTable)
      .values(testUser1)
      .returning()
      .execute();
    const user1 = user1Result[0];

    const user2Result = await db.insert(usersTable)
      .values(testUser2)
      .returning()
      .execute();
    const user2 = user2Result[0];

    // Create components for user1
    const component1: CreateComponentInput = {
      user_id: user1.id,
      name: 'User1 Button',
      type: 'button',
      properties: '{"color": "blue"}',
      is_global: false
    };

    const component2: CreateComponentInput = {
      user_id: user1.id,
      name: 'User1 Input',
      type: 'input',
      properties: '{"placeholder": "Enter text"}',
      is_global: false
    };

    // Create component for user2
    const component3: CreateComponentInput = {
      user_id: user2.id,
      name: 'User2 Card',
      type: 'card',
      properties: '{"title": "Card Title"}',
      is_global: false
    };

    await db.insert(componentsTable)
      .values([component1, component2, component3])
      .execute();

    // Test: Get components for user1
    const input: GetComponentsByUserIdInput = {
      user_id: user1.id
    };

    const result = await getComponentsByUserId(input);

    expect(result).toHaveLength(2);
    expect(result.every(comp => comp.user_id === user1.id)).toBe(true);
    expect(result.some(comp => comp.name === 'User1 Button')).toBe(true);
    expect(result.some(comp => comp.name === 'User1 Input')).toBe(true);
    expect(result.some(comp => comp.name === 'User2 Card')).toBe(false);
  });

  it('should include global components for any user', async () => {
    // Create test users
    const user1Result = await db.insert(usersTable)
      .values(testUser1)
      .returning()
      .execute();
    const user1 = user1Result[0];

    const user2Result = await db.insert(usersTable)
      .values(testUser2)
      .returning()
      .execute();
    const user2 = user2Result[0];

    // Create user-specific component for user1
    const userComponent: CreateComponentInput = {
      user_id: user1.id,
      name: 'User1 Private Button',
      type: 'button',
      properties: '{"color": "red"}',
      is_global: false
    };

    // Create global component owned by user2
    const globalComponent: CreateComponentInput = {
      user_id: user2.id,
      name: 'Global Header',
      type: 'navbar',
      properties: '{"brand": "MyApp"}',
      is_global: true
    };

    await db.insert(componentsTable)
      .values([userComponent, globalComponent])
      .execute();

    // Test: Get components for user1 (should include global component from user2)
    const input: GetComponentsByUserIdInput = {
      user_id: user1.id
    };

    const result = await getComponentsByUserId(input);

    expect(result).toHaveLength(2);
    expect(result.some(comp => comp.name === 'User1 Private Button' && comp.user_id === user1.id)).toBe(true);
    expect(result.some(comp => comp.name === 'Global Header' && comp.is_global === true)).toBe(true);
  });

  it('should return empty array for user with no components', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser1)
      .returning()
      .execute();
    const user = userResult[0];

    const input: GetComponentsByUserIdInput = {
      user_id: user.id
    };

    const result = await getComponentsByUserId(input);

    expect(result).toHaveLength(0);
  });

  it('should return all component fields correctly', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser1)
      .returning()
      .execute();
    const user = userResult[0];

    // Create component with all fields
    const component: CreateComponentInput = {
      user_id: user.id,
      name: 'Test Component',
      type: 'modal',
      properties: '{"width": 500, "height": 300}',
      is_global: true
    };

    await db.insert(componentsTable)
      .values(component)
      .execute();

    const input: GetComponentsByUserIdInput = {
      user_id: user.id
    };

    const result = await getComponentsByUserId(input);

    expect(result).toHaveLength(1);
    const comp = result[0];
    expect(comp.id).toBeDefined();
    expect(comp.user_id).toEqual(user.id);
    expect(comp.name).toEqual('Test Component');
    expect(comp.type).toEqual('modal');
    expect(comp.properties).toEqual('{"width": 500, "height": 300}');
    expect(comp.is_global).toBe(true);
    expect(comp.created_at).toBeInstanceOf(Date);
    expect(comp.updated_at).toBeInstanceOf(Date);
  });

  it('should return only global components for user with no personal components', async () => {
    // Create test users
    const user1Result = await db.insert(usersTable)
      .values(testUser1)
      .returning()
      .execute();
    const user1 = user1Result[0];

    const user2Result = await db.insert(usersTable)
      .values(testUser2)
      .returning()
      .execute();
    const user2 = user2Result[0];

    // Create only global component owned by user2
    const globalComponent: CreateComponentInput = {
      user_id: user2.id,
      name: 'Global Footer',
      type: 'footer',
      properties: '{"copyright": "2024"}',
      is_global: true
    };

    await db.insert(componentsTable)
      .values(globalComponent)
      .execute();

    // Test: Get components for user1 (should only get global component)
    const input: GetComponentsByUserIdInput = {
      user_id: user1.id
    };

    const result = await getComponentsByUserId(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Global Footer');
    expect(result[0].is_global).toBe(true);
    expect(result[0].user_id).toEqual(user2.id); // Owned by user2 but accessible to user1
  });
});
