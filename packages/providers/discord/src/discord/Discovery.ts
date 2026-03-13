/* eslint-disable @typescript-eslint/no-misused-promises */
import tags from "sholatku-reminder-shared/utils/Tags.js";
import { redisClient } from "../database/RedisClient.js";
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
        const pub = redisClient.duplicate();
        const guilds = client.guilds.cache.map((x) => x.id)
        const botId = client.user?.id

        const schema = {
            lastSeen: Date.now(),
            guilds
        }

        const data = JSON.stringify(schema)
        await pub.setex(`presence:discord:${botId}`, 70, data)
        console.log(`[${tags.System}] Sent a discovery data.`)
    }
}