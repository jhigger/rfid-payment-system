// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
	// NEXT_PUBLIC_CLIENTVAR: z.string(),
	NEXT_PUBLIC_API_KEY: z.string(),
	NEXT_PUBLIC_AUTH_DOMAIN: z.string(),
	NEXT_PUBLIC_PROJECT_ID: z.string(),
	NEXT_PUBLIC_STORAGE_BUCKET: z.string(),
	NEXT_PUBLIC_MESSAGING_SENDER_ID: z.string(),
	NEXT_PUBLIC_APP_ID: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
	// NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
	NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
	NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
	NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
	NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
	NEXT_PUBLIC_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
	NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
};
