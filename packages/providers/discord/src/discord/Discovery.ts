/* eslint-disable @typescript-eslint/no-misused-promises */
import { redisClient } from "sholatku-reminder-shared/redis/RedisClient.js";
import tags from "sholatku-reminder-shared/utils/Tags.js";
import client from "./Client.js";

export class Discovery {
    async start(): Promise<void> {
        console.log(`[${tags.System}] Discovery started.`)
        setInterval(async () => {
            await this.updateDiscovery()
        }, 60000);
        await this.updateDiscovery()
    }

    async updateDiscovery(): Promise<void> {
        const guilds = client.guilds.cache.map((x) => x.id)
        const botId = client.user?.id

        const schema = {
            lastSeen: Date.now(),
            guilds
        }

        const data = JSON.stringify(schema)
        await redisClient.setex(`presence:discord:${botId}`, 70, data)
        console.log(`[${tags.System}] Sent a discovery data.`)
    }
}