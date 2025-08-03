
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, componentsTable } from '../db/schema';
import { type CreateUserInput, type CreateComponentInput, type DeleteComponentInput } from '../schema';
import { deleteComponent } from '../handlers/delete_component';
import { eq, and } from 'drizzle-orm';

// Test data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User'
};

const otherUser: CreateUserInput = {
  email: 'other@example.com',
  name: 'Other User'
};

const testComponent: CreateComponentInput = {
  user_id: 1, // Will be set dynamically
  name: 'Test Button',
  type: 'button',
  properties: '{"color": "blue", "size": "medium"}',
  is_global: false
};

describe('deleteComponent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a component owned by the user', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test component
    const componentResult = await db.insert(componentsTable)
      .values({
        ...testComponent,
        user_id: userId
      })
      .returning()
      .execute();
    const componentId = componentResult[0].id;

    const input: DeleteComponentInput = {
      id: componentId,
      user_id: userId
    };

    const result = await deleteComponent(input);

    expect(result.success).toBe(true);

    // Verify component was deleted
    const components = await db.select()
      .from(componentsTable)
      .where(eq(componentsTable.id, componentId))
      .execute();

    expect(components).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent component', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    const input: DeleteComponentInput = {
      id: 999, // Non-existent component ID
      user_id: userId
    };

    const result = await deleteComponent(input);

    expect(result.success).toBe(false);
  });

  it('should return false when trying to delete component owned by another user', async () => {
    // Create two users
    const userResult1 = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId1 = userResult1[0].id;

    const userResult2 = await db.insert(usersTable)
      .values(otherUser)
      .returning()
      .execute();
    const userId2 = userResult2[0].id;

    // Create component owned by user1
    const componentResult = await db.insert(componentsTable)
      .values({
        ...testComponent,
        user_id: userId1
      })
      .returning()
      .execute();
    const componentId = componentResult[0].id;

    // Try to delete as user2
    const input: DeleteComponentInput = {
      id: componentId,
      user_id: userId2
    };

    const result = await deleteComponent(input);

    expect(result.success).toBe(false);

    // Verify component still exists
    const components = await db.select()
      .from(componentsTable)
      .where(eq(componentsTable.id, componentId))
      .execute();

    expect(components).toHaveLength(1);
    expect(components[0].user_id).toBe(userId1);
  });

  it('should not affect other components when deleting one', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create two components
    const component1Result = await db.insert(componentsTable)
      .values({
        ...testComponent,
        user_id: userId,
        name: 'Component 1'
      })
      .returning()
      .execute();
    const componentId1 = component1Result[0].id;

    const component2Result = await db.insert(componentsTable)
      .values({
        ...testComponent,
        user_id: userId,
        name: 'Component 2',
        type: 'input'
      })
      .returning()
      .execute();
    const componentId2 = component2Result[0].id;

    // Delete first component
    const input: DeleteComponentInput = {
      id: componentId1,
      user_id: userId
    };

    const result = await deleteComponent(input);

    expect(result.success).toBe(true);

    // Verify first component was deleted
    const deletedComponents = await db.select()
      .from(componentsTable)
      .where(eq(componentsTable.id, componentId1))
      .execute();

    expect(deletedComponents).toHaveLength(0);

    // Verify second component still exists
    const remainingComponents = await db.select()
      .from(componentsTable)
      .where(eq(componentsTable.id, componentId2))
      .execute();

    expect(remainingComponents).toHaveLength(1);
    expect(remainingComponents[0].name).toBe('Component 2');
  });
});
