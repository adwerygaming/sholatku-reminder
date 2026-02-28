/* eslint-disable @typescript-eslint/no-misused-promises */

import { Colors, ContainerBuilder, MessageFlags } from "discord.js"
import moment from "moment-timezone"
import { capitalizeWords } from "sholatku-reminder-core/src/sholatku/helper/Helper.js"
import { redisSubscriber } from "sholatku-reminder-shared/redis/RedisClient.js"
import { PrayerEvent, PrayerEventPayload, SerializedPrayerEventPayload } from "sholatku-reminder-shared/types/SholatKu.types.js"
import tags from "sholatku-reminder-shared/utils/Tags.js"
import client from "./Client.js"
import { SubscriptionProvider } from "sholatku-reminder-shared/types/Subscription.types.js"

interface SendMessageProp extends PrayerEventPayload {
    message: string
}

export class DiscordListener {
    constructor() {
        console.log(`[${tags.Discord}] Discord Listener initialized.`)
    }

    async sendMessage({ event, location, subscription, message }: SendMessageProp): Promise<boolean> {
        if (subscription.providerName !== SubscriptionProvider.Discord) return false

        const guilds = await client.guilds.fetch()

        if (!guilds) {
            console.log(`[${tags.Error}] No guilds found.`)
            return false
        }

        const guildId = subscription.metadata.guildId

        if (!guildId) {
            console.log(`[${tags.Error}] No guildId found in subscription metadata.`)
            return false
        }

        const guild = await guilds.get(guildId)?.fetch()

        if (!guild) {
            console.log(`[${tags.Error}] Guild with ID ${guildId} not found.`)
            return false
        }

        const channels = await guild.channels.fetch()

        if (!channels) {
            console.log(`[${tags.Error}] No channels found in guild ${guildId}.`)
            return false
        }

        const channelId = subscription.metadata.channelId

        if (!channelId) {
            console.log(`[${tags.Error}] No channelId found in subscription metadata.`)
            return false
        }

        const channel = await channels.get(channelId)?.fetch()

        if (!channel || !channel.isTextBased()) {
            console.log(`[${tags.Error}] Channel with ID ${channelId} not found or is not text-based.`)
            return false
        }

        try {
            const timeFormatted = moment().tz("Asia/Jakarta").locale("id").format("HH:mm:ss")

            const colorMap = {
                [PrayerEvent.PrayerTime]: Colors.DarkGreen,
                [PrayerEvent.PrayerIn5m]: Colors.Yellow,
                [PrayerEvent.PrayerIn15m]: Colors.Yellow,
                [PrayerEvent.PrayerIn30m]: Colors.Yellow,
                [PrayerEvent.NextPrayer]: Colors.Yellow
            }

            const container = new ContainerBuilder()
                .setAccentColor(colorMap[event.type])
                .addTextDisplayComponents(
                    text => text.setContent(`${message}`)
                )
                .addTextDisplayComponents(
                    text => text.setContent(`-# ${location.province}, ${location.city} @ ${timeFormatted}`)
                )

            await channel.send({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            })

            console.log(`[${tags.PrayerService}] Sent ${event.type} message to ${guild.name} on ${channel.name}.`)
            return true
        } catch (error) {
            console.log(`[${tags.Error}] Failed to send message to channel ${channelId} in guild ${guildId}.`)
            console.error(error)
            return false
        }
    }

    listen(): void {
        console.log(`[${tags.Discord}] Discord Listener started listening for events.`)

        void redisSubscriber.subscribe(...Object.values(PrayerEvent))

        redisSubscriber.on("message", async (channel, rawMessage) => {
            const raw = JSON.parse(rawMessage) as SerializedPrayerEventPayload

            const payload: PrayerEventPayload = {
                ...raw,
                event: { ...raw.event, time: moment(raw.event.time) }
            }

            const { event, location, subscription } = payload
            const isFriday = moment().day() === 5
            const diffInMinutes = event.time.diff(moment(), "minutes")
            const eventTime = event.time.format("HH:mm")

            let prayerName = event.eventName
            if (isFriday && prayerName === "dzuhur") prayerName = "jummah"

            let message: string | null = null

            switch (channel as PrayerEvent) {
                case PrayerEvent.PrayerTime:
                    switch (prayerName) {
                        case "terbit": message = `**The sun** has risen.`; break
                        case "imsak":  message = `It's **Imsak** time.`; break
                        default:       message = `It's time for ${capitalizeWords(prayerName)} prayer.`; break
                    }
                    break

                case PrayerEvent.PrayerIn5m:
                case PrayerEvent.PrayerIn15m:
                    switch (prayerName) {
                        case "terbit": message = `**The sun** will rise in **${diffInMinutes} minutes** at **${eventTime}**.`; break
                        case "imsak":  message = `**Imsak** will begin in **${diffInMinutes} minutes** at **${eventTime}**.`; break
                        default:       message = `${capitalizeWords(prayerName)} prayer will begin in **${diffInMinutes} minutes**.`; break
                    }
                    break

                case PrayerEvent.PrayerIn30m:
                    switch (prayerName) {
                        case "imsak":   message = `**Imsak** will begin in **${diffInMinutes} minutes** at **${eventTime}**.`; break
                        case "maghrib": message = `${capitalizeWords(prayerName)} prayer will begin in **${diffInMinutes} minutes** at **${eventTime}**.`; break
                    }
                    break
            }

            if (!message) return

            try {
                await this.sendMessage({ event, location, subscription, message })
            } catch (e) {
                console.error(`[${tags.Error}] sendMessage failed:`, e)
            }
        })
    }
}


