/* eslint-disable @typescript-eslint/no-misused-promises */
 
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountSchema } from 'sholatku-reminder-shared/types/Database.types.js';
import { DiscordPartialGuild } from 'sholatku-reminder-shared/types/Discord.types.js';
import { DiscordChannelRequestProp, DiscordChannelRequestResponse } from 'sholatku-reminder-shared/types/RPC.types.js';
import DatabaseClient from '../../Lib/DatabaseClient.js';
import { redisClient } from '../../Lib/RedisClient.js';
import { AuthenticatedRequest } from './discord.guard.js';

interface DiscoveryBase {
    lastSeen: string
}

interface DiscoveryDiscord extends DiscoveryBase {
    guilds: string[]
}

interface ResolveAccessTokenResponse {
    accessToken: string
    user: AuthenticatedRequest['session']['user']
}

@Injectable()
export class DiscordService {
    async resolveAccessToken(req: AuthenticatedRequest): Promise<ResolveAccessTokenResponse> {
        const { user } = req.session;

        // resolve betterauth to discord user id
        const [account] = await DatabaseClient.table<AccountSchema>("account")
            .select("accessToken")
            .where("userId", user.id)
            .andWhere("providerId", "discord")
            .limit(1);

        if (!account?.accessToken) throw new UnauthorizedException('No Discord account linked');

        console.log(`Resolved access token for user ${user.name}`);

        return {
            accessToken: account.accessToken,
            user,
        }
    }

    async fetchUserGuilds(req: AuthenticatedRequest): Promise<DiscordPartialGuild[]> {
        const { accessToken, user } = await this.resolveAccessToken(req)

        const cacheKey = `guilds:user:${user.id}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            console.log(`fetches user guild from cache`)
            return JSON.parse(cached) as DiscordPartialGuild[];
        }

        console.log(`fetches user guild from API`)
        try {
            const res = await fetch('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!res.ok) {
                throw new Error(`Discord API error: ${res.status} ${await res.text()}`);
            }

            const data = await res.json() as DiscordPartialGuild[];
            await redisClient.setex(cacheKey, 60 * 30, JSON.stringify(data));

            return data;
        } catch {
            console.error(`Failed to fetch guilds for user ${user.name}`);
            return []
        }
    }

    async fetchGuildChannels(guildId: string): Promise<DiscordChannelRequestResponse[]> {
        const requestId = crypto.randomUUID();
        const replyChannel = `discord:response:${requestId}`;

        const cacheKey = `channels:guild:${guildId}`;
        const cached = await redisClient.get(cacheKey);
        
        if (cached) {
            console.log(`fetches guild channels from cache for guild ${guildId}`)
            const cache = JSON.parse(cached) as DiscordChannelRequestResponse[];
            console.log(cache)
            return cache
        }

        console.log(`fetches guild channels from API for guild ${guildId}`)
        
        const sub = redisClient.duplicate();
        const pub = redisClient.duplicate();

        try {
            await sub.subscribe(replyChannel);

            const data = await new Promise<DiscordChannelRequestResponse[]>((resolve, reject) => {
                let isSettled = false;

                const messageHandler = async (_channel: string, message: string): Promise<void> => {
                    if (isSettled) return;
                    isSettled = true;

                    try {
                        await sub.unsubscribe(replyChannel).catch(() => null);
                        await sub.quit().catch(() => null);

                        const channels = JSON.parse(message) as DiscordChannelRequestResponse[];
                        await pub.setex(cacheKey, 30, JSON.stringify(channels));
                        resolve(channels);
                    } catch (e) {
                        reject(new Error(`Failed to parse channels: ${e instanceof Error ? e.message : String(e)}`));
                    }
                };

                setTimeout(() => {
                    if (isSettled) return;
                    isSettled = true;

                    void (async (): Promise<void> => {
                        await sub.unsubscribe(replyChannel).catch(() => null);
                        await sub.quit().catch(() => null);
                    })();

                    reject(new Error('Discord API timeout'));
                }, 6000);

                sub.on('message', messageHandler);

                void (async (): Promise<void> => {
                    try {
                        const request: DiscordChannelRequestProp = {
                            guildId,
                            replyTo: replyChannel,
                        };
                        await pub.publish('discord:channel_request', JSON.stringify(request));
                    } catch (e) {
                        if (!isSettled) {
                            isSettled = true;
                            reject(new Error(`Failed to publish request: ${e instanceof Error ? e.message : String(e)}`));
                        }
                    }
                })();
            });

            return data;
        } catch (err) {
            console.error(`Failed to fetch channels for guild ${guildId}:`, err);
            throw err;
        }
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
