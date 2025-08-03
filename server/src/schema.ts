
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  google_id: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  canvas_data: z.string(), // JSON string containing the canvas state
  is_public: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Component schema for reusable components
export const componentSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  type: z.enum(['button', 'input', 'image', 'card', 'container', 'grid', 'title', 'paragraph', 'icon', 'tab', 'accordion', 'modal', 'checkbox', 'radio', 'select', 'textarea', 'navbar', 'footer', 'layout']),
  properties: z.string(), // JSON string containing component properties
  is_global: z.boolean(), // Whether component is available to all users
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Component = z.infer<typeof componentSchema>;

// Input schemas for creating entities
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  google_id: z.string().nullable().optional()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createProjectInputSchema = z.object({
  user_id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  canvas_data: z.string().optional(), // Default to empty canvas
  is_public: z.boolean().optional() // Default to false
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const createComponentInputSchema = z.object({
  user_id: z.number(),
  name: z.string(),
  type: z.enum(['button', 'input', 'image', 'card', 'container', 'grid', 'title', 'paragraph', 'icon', 'tab', 'accordion', 'modal', 'checkbox', 'radio', 'select', 'textarea', 'navbar', 'footer', 'layout']),
  properties: z.string(),
  is_global: z.boolean().optional() // Default to false
});

export type CreateComponentInput = z.infer<typeof createComponentInputSchema>;

// Input schemas for updating entities
export const updateUserInputSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  google_id: z.string().nullable().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const updateProjectInputSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  canvas_data: z.string().optional(),
  is_public: z.boolean().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

export const updateComponentInputSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string().optional(),
  type: z.enum(['button', 'input', 'image', 'card', 'container', 'grid', 'title', 'paragraph', 'icon', 'tab', 'accordion', 'modal', 'checkbox', 'radio', 'select', 'textarea', 'navbar', 'footer', 'layout']).optional(),
  properties: z.string().optional(),
  is_global: z.boolean().optional()
});

export type UpdateComponentInput = z.infer<typeof updateComponentInputSchema>;

// Query input schemas
export const getUserByIdInputSchema = z.object({
  id: z.number()
});

export type GetUserByIdInput = z.infer<typeof getUserByIdInputSchema>;

export const getUserByEmailInputSchema = z.object({
  email: z.string().email()
});

export type GetUserByEmailInput = z.infer<typeof getUserByEmailInputSchema>;

export const getProjectsByUserIdInputSchema = z.object({
  user_id: z.number()
});

export type GetProjectsByUserIdInput = z.infer<typeof getProjectsByUserIdInputSchema>;

export const getProjectByIdInputSchema = z.object({
  id: z.number(),
  user_id: z.number() // For authorization
});

export type GetProjectByIdInput = z.infer<typeof getProjectByIdInputSchema>;

export const getComponentsByUserIdInputSchema = z.object({
  user_id: z.number()
});

export type GetComponentsByUserIdInput = z.infer<typeof getComponentsByUserIdInputSchema>;

export const deleteProjectInputSchema = z.object({
  id: z.number(),
  user_id: z.number() // For authorization
});

export type DeleteProjectInput = z.infer<typeof deleteProjectInputSchema>;

export const deleteComponentInputSchema = z.object({
  id: z.number(),
  user_id: z.number() // For authorization
});

export type DeleteComponentInput = z.infer<typeof deleteComponentInputSchema>;
