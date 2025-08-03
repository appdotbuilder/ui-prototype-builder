
import { serial, text, pgTable, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define component type enum
export const componentTypeEnum = pgEnum('component_type', [
  'button', 'input', 'image', 'card', 'container', 'grid', 'title', 'paragraph', 
  'icon', 'tab', 'accordion', 'modal', 'checkbox', 'radio', 'select', 'textarea', 
  'navbar', 'footer', 'layout'
]);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  google_id: text('google_id'), // Nullable for non-Google auth users
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table
export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'), // Nullable description
  canvas_data: text('canvas_data').notNull().default('{}'), // JSON string for canvas state
  is_public: boolean('is_public').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Components table for reusable components
export const componentsTable = pgTable('components', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: componentTypeEnum('type').notNull(),
  properties: text('properties').notNull().default('{}'), // JSON string for component properties
  is_global: boolean('is_global').notNull().default(false), // Global components available to all users
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  projects: many(projectsTable),
  components: many(componentsTable),
}));

export const projectsRelations = relations(projectsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [projectsTable.user_id],
    references: [usersTable.id],
  }),
}));

export const componentsRelations = relations(componentsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [componentsTable.user_id],
    references: [usersTable.id],
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
export type Component = typeof componentsTable.$inferSelect;
export type NewComponent = typeof componentsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  users: usersTable, 
  projects: projectsTable, 
  components: componentsTable 
};
