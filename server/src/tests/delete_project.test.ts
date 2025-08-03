
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable } from '../db/schema';
import { type DeleteProjectInput } from '../schema';
import { deleteProject } from '../handlers/delete_project';
import { eq } from 'drizzle-orm';

describe('deleteProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a project successfully', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();
    const user = userResult[0];

    // Create test project
    const projectResult = await db.insert(projectsTable)
      .values({
        user_id: user.id,
        name: 'Test Project',
        description: 'A test project',
        canvas_data: '{"elements": []}',
        is_public: false
      })
      .returning()
      .execute();
    const project = projectResult[0];

    const input: DeleteProjectInput = {
      id: project.id,
      user_id: user.id
    };

    const result = await deleteProject(input);

    expect(result.success).toBe(true);

    // Verify project was deleted
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project.id))
      .execute();

    expect(projects).toHaveLength(0);
  });

  it('should return false when project does not exist', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();
    const user = userResult[0];

    const input: DeleteProjectInput = {
      id: 999, // Non-existent project ID
      user_id: user.id
    };

    const result = await deleteProject(input);

    expect(result.success).toBe(false);
  });

  it('should return false when user does not own the project', async () => {
    // Create test users
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        name: 'User One'
      })
      .returning()
      .execute();
    const user1 = user1Result[0];

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        name: 'User Two'
      })
      .returning()
      .execute();
    const user2 = user2Result[0];

    // Create project owned by user1
    const projectResult = await db.insert(projectsTable)
      .values({
        user_id: user1.id,
        name: 'User One Project',
        description: 'A project owned by user1',
        canvas_data: '{"elements": []}',
        is_public: false
      })
      .returning()
      .execute();
    const project = projectResult[0];

    // Try to delete with user2
    const input: DeleteProjectInput = {
      id: project.id,
      user_id: user2.id
    };

    const result = await deleteProject(input);

    expect(result.success).toBe(false);

    // Verify project still exists
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toEqual('User One Project');
  });

  it('should not affect other projects when deleting one', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();
    const user = userResult[0];

    // Create multiple test projects
    const project1Result = await db.insert(projectsTable)
      .values({
        user_id: user.id,
        name: 'Project One',
        description: 'First project',
        canvas_data: '{"elements": []}',
        is_public: false
      })
      .returning()
      .execute();
    const project1 = project1Result[0];

    const project2Result = await db.insert(projectsTable)
      .values({
        user_id: user.id,
        name: 'Project Two',
        description: 'Second project',
        canvas_data: '{"elements": []}',
        is_public: true
      })
      .returning()
      .execute();
    const project2 = project2Result[0];

    // Delete first project
    const input: DeleteProjectInput = {
      id: project1.id,
      user_id: user.id
    };

    const result = await deleteProject(input);

    expect(result.success).toBe(true);

    // Verify only the first project was deleted
    const remainingProjects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.user_id, user.id))
      .execute();

    expect(remainingProjects).toHaveLength(1);
    expect(remainingProjects[0].id).toEqual(project2.id);
    expect(remainingProjects[0].name).toEqual('Project Two');
  });
});
