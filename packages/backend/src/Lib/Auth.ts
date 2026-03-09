import { betterAuth } from 'better-auth';
import { nextCookies } from "better-auth/next-js";
import { Pool } from 'pg';
import { env } from '../Utils/EnvManager.js';

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: new Pool({
        connectionString: env.PG_CONNECTION_STRING // sync dont forgoet to sync ok !!!!
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        discord: {
            clientId: env.OAUTH_DISCORD_CLIENT_ID,
            clientSecret: env.OAUTH_DISCORD_CLIENT_SECRET
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },
    trustedOrigins: [env.FRONTEND_URL ?? 'http://localhost:3000'],
    plugins: [nextCookies()]
});
