import KeyvRedis from "@keyv/redis";
import { Cacheable } from "cacheable";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

const cacheClient = new Cacheable({
    secondary: new KeyvRedis(`redis://${REDIS_HOST}:${REDIS_PORT}`),
    nonBlocking: true
})

export default cacheClient