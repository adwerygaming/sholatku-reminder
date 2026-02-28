import KeyvRedis from "@keyv/redis";
import { Cacheable } from "cacheable";
import { env } from "../utils/EnvManager.js";

const REDIS_HOST = env.REDIS_HOST;
const REDIS_PORT = parseInt(env.REDIS_PORT);

const cacheClient = new Cacheable({
    secondary: new KeyvRedis(`redis://${REDIS_HOST}:${REDIS_PORT}`),
    nonBlocking: true
})

export default cacheClient