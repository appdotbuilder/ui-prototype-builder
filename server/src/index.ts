
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createUserInputSchema,
  getUserByEmailInputSchema,
  getUserByIdInputSchema,
  updateUserInputSchema,
  createProjectInputSchema,
  getProjectsByUserIdInputSchema,
  getProjectByIdInputSchema,
  updateProjectInputSchema,
  deleteProjectInputSchema,
  createComponentInputSchema,
  getComponentsByUserIdInputSchema,
  updateComponentInputSchema,
  deleteComponentInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUserByEmail } from './handlers/get_user_by_email';
import { getUserById } from './handlers/get_user_by_id';
import { updateUser } from './handlers/update_user';
import { createProject } from './handlers/create_project';
import { getProjectsByUserId } from './handlers/get_projects_by_user_id';
import { getProjectById } from './handlers/get_project_by_id';
import { updateProject } from './handlers/update_project';
import { deleteProject } from './handlers/delete_project';
import { createComponent } from './handlers/create_component';
import { getComponentsByUserId } from './handlers/get_components_by_user_id';
import { getGlobalComponents } from './handlers/get_global_components';
import { updateComponent } from './handlers/update_component';
import { deleteComponent } from './handlers/delete_component';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  getUserByEmail: publicProcedure
    .input(getUserByEmailInputSchema)
    .query(({ input }) => getUserByEmail(input)),
  
  getUserById: publicProcedure
    .input(getUserByIdInputSchema)
    .query(({ input }) => getUserById(input)),
  
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),

  // Project management routes
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),
  
  getProjectsByUserId: publicProcedure
    .input(getProjectsByUserIdInputSchema)
    .query(({ input }) => getProjectsByUserId(input)),
  
  getProjectById: publicProcedure
    .input(getProjectByIdInputSchema)
    .query(({ input }) => getProjectById(input)),
  
  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),
  
  deleteProject: publicProcedure
    .input(deleteProjectInputSchema)
    .mutation(({ input }) => deleteProject(input)),

  // Component management routes
  createComponent: publicProcedure
    .input(createComponentInputSchema)
    .mutation(({ input }) => createComponent(input)),
  
  getComponentsByUserId: publicProcedure
    .input(getComponentsByUserIdInputSchema)
    .query(({ input }) => getComponentsByUserId(input)),
  
  getGlobalComponents: publicProcedure
    .query(() => getGlobalComponents()),
  
  updateComponent: publicProcedure
    .input(updateComponentInputSchema)
    .mutation(({ input }) => updateComponent(input)),
  
  deleteComponent: publicProcedure
    .input(deleteComponentInputSchema)
    .mutation(({ input }) => deleteComponent(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
