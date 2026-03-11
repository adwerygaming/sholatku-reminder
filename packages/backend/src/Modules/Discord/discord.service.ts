import { Injectable, UnauthorizedException } from '@nestjs/common';
import { redisClient } from 'sholatku-reminder-shared/redis/RedisClient.js';
import { AccountSchema } from 'sholatku-reminder-shared/types/Database.types.js';
import { DiscordPartialGuild } from 'sholatku-reminder-shared/types/Discord.types.js';
import DatabaseClient from '../../Lib/DatabaseClient.js';
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
        // TODO: Add Caching later
        
        const { user } = req.session;

        // resolve betterauth to discord user id
        const [account] = await DatabaseClient.table<AccountSchema>("account")
            .select("accessToken")
            .where("userId", user.id)
            .andWhere("providerId", "discord")
            .limit(1);

        if (!account?.accessToken) throw new UnauthorizedException('No Discord account linked');

        const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${account.accessToken}` },
        });

        if (!res.ok) {
            throw new Error(`Discord API error: ${res.status} ${await res.text()}`);
        }

        // force set
        const data: Promise<DiscordPartialGuild[]> = res.json()

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
        console.log("fetching guilds")
        const botGuilds = await this.fetchBotGuilds()   // guild IDs where bot is present
        const userGuilds = await this.fetchUserGuilds(req)

        // guilds where BOTH the user AND the bot are present
        const guilds = userGuilds.filter((userGuild) => botGuilds.includes(userGuild.id))

        return guilds
    }
}
