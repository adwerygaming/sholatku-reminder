import { Redis } from "ioredis";
import { env } from "../utils/EnvManager.js";

const REDIS_HOST = env.REDIS_HOST;
const REDIS_PORT = parseInt(env.REDIS_PORT);

/** Use for publishing events (core) */
export const redisPublisher = new Redis(REDIS_PORT, REDIS_HOST);

/** Use for subscribing to events (discord, whatsapp, etc.) */
export const redisSubscriber = new Redis(REDIS_PORT, REDIS_HOST);