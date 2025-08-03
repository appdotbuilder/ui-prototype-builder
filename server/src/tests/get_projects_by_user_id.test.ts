
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable } from '../db/schema';
import { type GetProjectsByUserIdInput } from '../schema';
import { getProjectsByUserId } from '../handlers/get_projects_by_user_id';

// Test data
const testUser = {
  email: 'test@example.com',
  name: 'Test User'
};

const testProject1 = {
  name: 'First Project',
  description: 'First test project',
  canvas_data: '{"elements": []}',
  is_public: false
};

const testProject2 = {
  name: 'Second Project',
  description: 'Second test project',
  canvas_data: '{"elements": ["button"]}',
  is_public: true
};

describe('getProjectsByUserId', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return projects for existing user', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = userResult[0];

    // Create test projects
    await db.insert(projectsTable)
      .values([
        { ...testProject1, user_id: user.id },
        { ...testProject2, user_id: user.id }
      ])
      .execute();

    const input: GetProjectsByUserIdInput = {
      user_id: user.id
    };

    const result = await getProjectsByUserId(input);

    expect(result).toHaveLength(2);
    
    // Verify first project
    const project1 = result.find(p => p.name === 'First Project');
    expect(project1).toBeDefined();
    expect(project1!.user_id).toEqual(user.id);
    expect(project1!.description).toEqual('First test project');
    expect(project1!.canvas_data).toEqual('{"elements": []}');
    expect(project1!.is_public).toEqual(false);
    expect(project1!.created_at).toBeInstanceOf(Date);
    expect(project1!.updated_at).toBeInstanceOf(Date);

    // Verify second project
    const project2 = result.find(p => p.name === 'Second Project');
    expect(project2).toBeDefined();
    expect(project2!.user_id).toEqual(user.id);
    expect(project2!.description).toEqual('Second test project');
    expect(project2!.canvas_data).toEqual('{"elements": ["button"]}');
    expect(project2!.is_public).toEqual(true);
  });

  it('should return empty array for user with no projects', async () => {
    // Create test user but no projects
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = userResult[0];

    const input: GetProjectsByUserIdInput = {
      user_id: user.id
    };

    const result = await getProjectsByUserId(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent user', async () => {
    const input: GetProjectsByUserIdInput = {
      user_id: 99999 // Non-existent user ID
    };

    const result = await getProjectsByUserId(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return projects for the specified user', async () => {
    // Create two test users
    const user1Result = await db.insert(usersTable)
      .values({ ...testUser, email: 'user1@example.com' })
      .returning()
      .execute();
    const user1 = user1Result[0];

    const user2Result = await db.insert(usersTable)
      .values({ ...testUser, email: 'user2@example.com' })
      .returning()
      .execute();
    const user2 = user2Result[0];

    // Create projects for both users
    await db.insert(projectsTable)
      .values([
        { ...testProject1, user_id: user1.id },
        { ...testProject2, user_id: user2.id }
      ])
      .execute();

    const input: GetProjectsByUserIdInput = {
      user_id: user1.id
    };

    const result = await getProjectsByUserId(input);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(user1.id);
    expect(result[0].name).toEqual('First Project');
  });
});
