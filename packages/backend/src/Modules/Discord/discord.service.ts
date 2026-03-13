import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountSchema } from 'sholatku-reminder-shared/types/Database.types.js';
import { DiscordPartialGuild } from 'sholatku-reminder-shared/types/Discord.types.js';
import DatabaseClient from '../../Lib/DatabaseClient.js';
import { redisClient } from '../../Lib/RedisClient.js';
import { AuthenticatedRequest } from './discord.guard.js';

interface DiscoveryBase {
    lastSeen: string
}

interface DiscoveryDiscord extends DiscoveryBase {
    guilds: string[]
}

@Injectable()
export class DiscordService {
    async fetchUserGuilds(req: AuthenticatedRequest): Promise<DiscordPartialGuild[]> {
        const { user } = req.session;

        const cacheKey = `guilds:user:${user.id}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            console.log(`fetches user guild from cache`)
            return JSON.parse(cached) as DiscordPartialGuild[];
        }

        // resolve betterauth to discord user id
        const [account] = await DatabaseClient.table<AccountSchema>("account")
            .select("accessToken")
            .where("userId", user.id)
            .andWhere("providerId", "discord")
            .limit(1);

        if (!account?.accessToken) throw new UnauthorizedException('No Discord account linked');

        console.log(`fetches user guild from API`)
        const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${account.accessToken}` },
        });

        if (!res.ok) {
            throw new Error(`Discord API error: ${res.status} ${await res.text()}`);
        }

        const data = await res.json() as DiscordPartialGuild[];

        await redisClient.setex(cacheKey, 60 * 10, JSON.stringify(data));

        return data;
    }

    async fetchBotGuilds(): Promise<string[]> {
        const keys = await redisClient.keys("presence:discord:*")
        if (keys.length === 0) return []

        const values = await redisClient.mget(...keys)

        const data = values.map((x) => {
            const parsed = JSON.parse(x as string) as DiscoveryDiscord
            return parsed.guilds
        })

        return data.flat()
    }

    async fetchAvailableGuilds(req: AuthenticatedRequest): Promise<DiscordPartialGuild[]> {
        const botGuilds = await this.fetchBotGuilds()   // guild IDs where bot is present
        const userGuilds = await this.fetchUserGuilds(req)

        // guilds where BOTH the user AND the bot are present
        const guilds = userGuilds.filter((userGuild) => botGuilds.includes(userGuild.id))

        return guilds
    }
}
