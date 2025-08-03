
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable } from '../db/schema';
import { type UpdateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq, and } from 'drizzle-orm';

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update project name', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();

    // Create test project
    const project = await db.insert(projectsTable)
      .values({
        user_id: user[0].id,
        name: 'Original Project',
        description: 'Original description',
        canvas_data: '{"version": 1}',
        is_public: false
      })
      .returning()
      .execute();

    const input: UpdateProjectInput = {
      id: project[0].id,
      user_id: user[0].id,
      name: 'Updated Project Name'
    };

    const result = await updateProject(input);

    expect(result.name).toEqual('Updated Project Name');
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.canvas_data).toEqual('{"version": 1}'); // Should remain unchanged
    expect(result.is_public).toEqual(false); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > project[0].updated_at).toBe(true);
  });

  it('should update multiple fields', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();

    // Create test project
    const project = await db.insert(projectsTable)
      .values({
        user_id: user[0].id,
        name: 'Original Project',
        description: 'Original description',
        canvas_data: '{"version": 1}',
        is_public: false
      })
      .returning()
      .execute();

    const input: UpdateProjectInput = {
      id: project[0].id,
      user_id: user[0].id,
      name: 'Updated Project',
      description: 'Updated description',
      canvas_data: '{"version": 2, "components": []}',
      is_public: true
    };

    const result = await updateProject(input);

    expect(result.name).toEqual('Updated Project');
    expect(result.description).toEqual('Updated description');
    expect(result.canvas_data).toEqual('{"version": 2, "components": []}');
    expect(result.is_public).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update description to null', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();

    // Create test project with description
    const project = await db.insert(projectsTable)
      .values({
        user_id: user[0].id,
        name: 'Test Project',
        description: 'Original description'
      })
      .returning()
      .execute();

    const input: UpdateProjectInput = {
      id: project[0].id,
      user_id: user[0].id,
      description: null
    };

    const result = await updateProject(input);

    expect(result.description).toBeNull();
    expect(result.name).toEqual('Test Project'); // Should remain unchanged
  });

  it('should save changes to database', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();

    // Create test project
    const project = await db.insert(projectsTable)
      .values({
        user_id: user[0].id,
        name: 'Original Project',
        description: 'Original description'
      })
      .returning()
      .execute();

    const input: UpdateProjectInput = {
      id: project[0].id,
      user_id: user[0].id,
      name: 'Database Updated Project'
    };

    await updateProject(input);

    // Verify the changes were saved to database
    const updatedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project[0].id))
      .execute();

    expect(updatedProject).toHaveLength(1);
    expect(updatedProject[0].name).toEqual('Database Updated Project');
    expect(updatedProject[0].description).toEqual('Original description');
    expect(updatedProject[0].updated_at > project[0].updated_at).toBe(true);
  });

  it('should reject update for non-existent project', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();

    const input: UpdateProjectInput = {
      id: 99999, // Non-existent project ID
      user_id: user[0].id,
      name: 'Should Not Work'
    };

    expect(updateProject(input)).rejects.toThrow(/project not found/i);
  });

  it('should reject update for project owned by different user', async () => {
    // Create test users
    const user1 = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        name: 'User 1'
      })
      .returning()
      .execute();

    const user2 = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        name: 'User 2'
      })
      .returning()
      .execute();

    // Create project owned by user1
    const project = await db.insert(projectsTable)
      .values({
        user_id: user1[0].id,
        name: 'User 1 Project'
      })
      .returning()
      .execute();

    // Try to update with user2's ID
    const input: UpdateProjectInput = {
      id: project[0].id,
      user_id: user2[0].id, // Different user
      name: 'Unauthorized Update'
    };

    expect(updateProject(input)).rejects.toThrow(/project not found/i);
  });
});
