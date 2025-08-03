
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, projectsTable } from '../db/schema';
import { type GetProjectByIdInput } from '../schema';
import { getProjectById } from '../handlers/get_project_by_id';

describe('getProjectById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return project owned by the user', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'testuser@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test project
    const projectResult = await db.insert(projectsTable)
      .values({
        user_id: userId,
        name: 'Test Project',
        description: 'A test project',
        canvas_data: '{"components": []}',
        is_public: false
      })
      .returning()
      .execute();
    const projectId = projectResult[0].id;

    const input: GetProjectByIdInput = {
      id: projectId,
      user_id: userId
    };

    const result = await getProjectById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(projectId);
    expect(result!.user_id).toBe(userId);
    expect(result!.name).toBe('Test Project');
    expect(result!.description).toBe('A test project');
    expect(result!.canvas_data).toBe('{"components": []}');
    expect(result!.is_public).toBe(false);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return public project even if not owned by user', async () => {
    // Create two test users
    const ownerResult = await db.insert(usersTable)
      .values({
        email: 'owner@example.com',
        name: 'Project Owner'
      })
      .returning()
      .execute();
    const ownerId = ownerResult[0].id;

    const viewerResult = await db.insert(usersTable)
      .values({
        email: 'viewer@example.com',
        name: 'Project Viewer'
      })
      .returning()
      .execute();
    const viewerId = viewerResult[0].id;

    // Create public project owned by first user
    const projectResult = await db.insert(projectsTable)
      .values({
        user_id: ownerId,
        name: 'Public Project',
        description: 'A public project',
        canvas_data: '{"components": []}',
        is_public: true
      })
      .returning()
      .execute();
    const projectId = projectResult[0].id;

    const input: GetProjectByIdInput = {
      id: projectId,
      user_id: viewerId // Different user trying to access
    };

    const result = await getProjectById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(projectId);
    expect(result!.user_id).toBe(ownerId); // Original owner
    expect(result!.name).toBe('Public Project');
    expect(result!.is_public).toBe(true);
  });

  it('should return null for private project not owned by user', async () => {
    // Create two test users
    const ownerResult = await db.insert(usersTable)
      .values({
        email: 'owner@example.com',
        name: 'Project Owner'
      })
      .returning()
      .execute();
    const ownerId = ownerResult[0].id;

    const viewerResult = await db.insert(usersTable)
      .values({
        email: 'viewer@example.com',
        name: 'Project Viewer'
      })
      .returning()
      .execute();
    const viewerId = viewerResult[0].id;

    // Create private project owned by first user
    const projectResult = await db.insert(projectsTable)
      .values({
        user_id: ownerId,
        name: 'Private Project',
        description: 'A private project',
        canvas_data: '{"components": []}',
        is_public: false
      })
      .returning()
      .execute();
    const projectId = projectResult[0].id;

    const input: GetProjectByIdInput = {
      id: projectId,
      user_id: viewerId // Different user trying to access
    };

    const result = await getProjectById(input);

    expect(result).toBeNull();
  });

  it('should return null for non-existent project', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'testuser@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const input: GetProjectByIdInput = {
      id: 99999, // Non-existent project ID
      user_id: userId
    };

    const result = await getProjectById(input);

    expect(result).toBeNull();
  });

  it('should handle projects with null description', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'testuser@example.com',
        name: 'Test User'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create project with null description
    const projectResult = await db.insert(projectsTable)
      .values({
        user_id: userId,
        name: 'Project Without Description',
        description: null,
        canvas_data: '{}',
        is_public: false
      })
      .returning()
      .execute();
    const projectId = projectResult[0].id;

    const input: GetProjectByIdInput = {
      id: projectId,
      user_id: userId
    };

    const result = await getProjectById(input);

    expect(result).not.toBeNull();
    expect(result!.description).toBeNull();
    expect(result!.name).toBe('Project Without Description');
  });
});
