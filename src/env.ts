import { defineEnvVars } from "@sveltejs/kit/env";

// SvelteKit 3 environment variables. Values are read from `.env` in dev and
// from the platform environment in production. Private by default.
export const variables = defineEnvVars({
	DATABASE_URL: {},
});
