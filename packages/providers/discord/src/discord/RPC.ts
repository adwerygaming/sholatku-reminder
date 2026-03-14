/* eslint-disable @typescript-eslint/no-misused-promises */
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { DiscordChannelRequestProp, DiscordChannelRequestResponse } from 'sholatku-reminder-shared/types/RPC.types.js';
import tags from 'sholatku-reminder-shared/utils/Tags.js';
import { redisClient } from "../database/RedisClient.js";
import client from './Client.js';

export class RPC {
    async start(): Promise<void> {
        console.log(`[${tags.System}] RPC started.`)
        await this.channelRequest()
    }

    async channelRequest(): Promise<void> {
        console.log(`[${tags.System}] RPC channel request listener started.`)
        
        const sub = redisClient.duplicate();
        const pub = redisClient.duplicate();
        await sub.subscribe('discord:channel_request')

        sub.on('message', async (_channel, message) => {
            const data = JSON.parse(message) as DiscordChannelRequestProp

            const guildId = data.guildId
            const check = client.guilds.cache.get(guildId)

            if (check) {
                const guild = await check.fetch()
                const me = guild.members.me ?? await guild.members.fetchMe().catch(() => null)

                if (!me) {
                    await pub.publish(data.replyTo, JSON.stringify([]))
                    return
                }

                const channels = await guild.channels.fetch()

                const textChannels: DiscordChannelRequestResponse[] = channels
                    .filter((c) => c !== null)
                    .filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
                    .filter((c) => {
                        const permissions = c.permissionsFor(me)
                        if (!permissions) return false

                        return permissions.has(PermissionFlagsBits.ViewChannel)
                            && permissions.has(PermissionFlagsBits.SendMessages)
                    })
                    .map((c) => ({
                        id: c.id,
                        name: c.name,
                    }))

                await pub.publish(data.replyTo, JSON.stringify(textChannels))
            }
        })
    }
}