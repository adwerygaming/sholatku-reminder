import { config } from "dotenv";
import "dotenv/config";

import path, { dirname, resolve } from "path";
import Tags from "sholatku-reminder-shared/utils/Tags.js";
import { fileURLToPath } from "url";
import { z } from "zod";

// Schema for .env file,
// Make sure to sync this.
// Default value are: z.string()
const envSchema = z.object({
    REDIS_HOST: z.string(),
    REDIS_PORT: z.string(),
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// relative path from builded (dist) files.
const sharedRoot = path.join(__dirname, "..")

config({ path: resolve(sharedRoot, ".env") });

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