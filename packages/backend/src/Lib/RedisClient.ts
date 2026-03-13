import { Redis } from "ioredis";
import { env } from "../Utils/EnvManager.js";

const REDIS_HOST = env.REDIS_HOST;
const REDIS_PORT = parseInt(env.REDIS_PORT);

export const redisClient = new Redis(REDIS_PORT, REDIS_HOST);