import "dotenv/config";
import tags from "sholatku-reminder-shared/utils/Tags.js";

import { z } from "zod";

const envSchema = z.object({
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    
    PG_CONNECTION_STRING: z.string(),
    
    OAUTH_DISCORD_CLIENT_ID: z.string(),
    OAUTH_DISCORD_CLIENT_SECRET: z.string(),

    FRONTEND_URL: z.string(),
    BACKEND_PORT: z.string(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.string()
})

const envParsed = envSchema.safeParse(process.env)

if (envParsed.error || Object.keys(envParsed?.data ?? {}).length == 0) {
    console.log(`[${tags.Error}] Invalid Env Variable.`)
    console.log(envParsed.error)
    throw new Error(`.env not satisfied`)
}

if (envParsed.success) {
    console.log(`[${tags.System}] Env check success.`)
}

export const env = envParsed.data