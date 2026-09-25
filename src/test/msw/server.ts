import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Node-side MSW server used by Vitest. Tests can override handlers per-case with
// `server.use(...)`; the setup file resets them after each test.
export const server = setupServer(...handlers);
