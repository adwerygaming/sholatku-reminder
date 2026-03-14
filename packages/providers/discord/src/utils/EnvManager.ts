import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Tags from "sholatku-reminder-shared/utils/Tags.js";
import { z } from "zod";

// Schema for .env file,
// Make sure to sync this.
// Default value are: z.string()
const envSchema = z.object({
    NODE_ENV: z.enum(["PROD", "DEV"]).optional(),
    DISCORD_TOKEN: z.string(),
    DISCORD_CLIENT_ID: z.string(),

    REDIS_PORT: z.string(),
    REDIS_HOST: z.string(),
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../../.env") });

const envParsed = envSchema.safeParse(process.env)

if (envParsed.error || Object.keys(envParsed?.data ?? {}).length == 0) {
    console.log(`[${Tags.Error}] Invalid Env Variable.`)
    console.log(envParsed.error)
    throw new Error(`.env not satisfied`)
}

if (envParsed.success) {
    console.log(`[${Tags.System}] Env check success.`)
}

export const env = envParsed.data