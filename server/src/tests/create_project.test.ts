
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable, usersTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

// Test data
const testUser = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: null
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project with all fields', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    const testInput: CreateProjectInput = {
      user_id: userId,
      name: 'Test Project',
      description: 'A project for testing',
      canvas_data: '{"elements": []}',
      is_public: true
    };

    const result = await createProject(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Project');
    expect(result.description).toEqual('A project for testing');
    expect(result.canvas_data).toEqual('{"elements": []}');
    expect(result.is_public).toEqual(true);
    expect(result.user_id).toEqual(userId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a project with minimal fields and defaults', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    const testInput: CreateProjectInput = {
      user_id: userId,
      name: 'Minimal Project'
    };

    const result = await createProject(testInput);

    // Verify defaults are applied
    expect(result.name).toEqual('Minimal Project');
    expect(result.description).toBeNull();
    expect(result.canvas_data).toEqual('{}');
    expect(result.is_public).toEqual(false);
    expect(result.user_id).toEqual(userId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save project to database', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    const testInput: CreateProjectInput = {
      user_id: userId,
      name: 'Database Test Project',
      description: 'Testing database persistence',
      canvas_data: '{"test": true}',
      is_public: false
    };

    const result = await createProject(testInput);

    // Query using proper drizzle syntax
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toEqual('Database Test Project');
    expect(projects[0].description).toEqual('Testing database persistence');
    expect(projects[0].canvas_data).toEqual('{"test": true}');
    expect(projects[0].is_public).toEqual(false);
    expect(projects[0].user_id).toEqual(userId);
    expect(projects[0].created_at).toBeInstanceOf(Date);
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent user', async () => {
    const testInput: CreateProjectInput = {
      user_id: 999999, // Non-existent user ID
      name: 'Invalid Project'
    };

    await expect(createProject(testInput)).rejects.toThrow(/user with id 999999 does not exist/i);
  });
});
