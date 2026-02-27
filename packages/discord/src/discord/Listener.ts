/* eslint-disable @typescript-eslint/no-misused-promises */

import { Colors, ContainerBuilder, MessageFlags } from "discord.js"
import moment from "moment-timezone"
import { PrayerEvent, PrayerEventPayload, sholatkuClient, SubscriptionProvider } from "sholatku-reminder-core"
import tags from "sholatku-reminder-shared/utils/Tags.js"
import { capitalizeWords } from "../../../core/src/sholatku/helper/Helper.js"
import client from "./Client.js"

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
            const timeFormatted = event.time.tz("Asia/Jakarta").locale("id").format("HH:mm:ss")

            const container = new ContainerBuilder()
                .setAccentColor(Colors.DarkGreen)
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

            console.log(`[${tags.PrayerService}] Message sent to channel ${channelId} in guild ${guildId}.`)
            return true
        } catch (error) {
            console.log(`[${tags.Error}] Failed to send message to channel ${channelId} in guild ${guildId}.`)
            console.error(error)
            return false
        }
    }

    listen(): void {
        console.log(`[${tags.Discord}] Discord Listener started listening for events.`)

        sholatkuClient.on(PrayerEvent.PrayerTime, async (payload) => {
            const event = payload.event
            const location = payload.location
            const subscription = payload.subscription

            const isFriday = moment().day() === 5

            let prayerName = event.eventName
            let message = null

            if (isFriday) {
                prayerName = "jummah"
            }

            switch (prayerName) {
                case "terbit":
                    message = `**The sun** has risen.`
                    break;

                case "imsak":
                    message = `It's **Imsak** time.`
                    break;

                default:
                    message = `It's time for ${capitalizeWords(prayerName)} prayer.`
                    break;
            }

            if (!message) return

            await this.sendMessage({ event, location, subscription, message })
        })

        sholatkuClient.on(PrayerEvent.PrayerIn5m, async (payload) => {
            const event = payload.event
            const location = payload.location
            const subscription = payload.subscription

            const isFriday = moment().day() === 5

            const diffInMinutes = event.time.diff(moment(), "minutes")

            let prayerName = event.eventName
            let message = null

            if (isFriday) {
                prayerName = "jummah"
            }

            switch (prayerName) {
                case "terbit":
                    message = `**The sun** will rise in **${diffInMinutes} minutes**.`
                    break;

                case "imsak":
                    message = `**Imsak** will begin in **${diffInMinutes} minutes**.`
                    break;

                default:
                    message = `${capitalizeWords(prayerName)} prayer will begin in **${diffInMinutes} minutes**.`
                    break;
            }

            if (!message) return

            await this.sendMessage({ event, location, subscription, message })
        })

        sholatkuClient.on(PrayerEvent.PrayerIn15m, async (payload) => {
            const event = payload.event
            const location = payload.location
            const subscription = payload.subscription

            const isFriday = moment().day() === 5

            const diffInMinutes = event.time.diff(moment(), "minutes")

            let prayerName = event.eventName
            let message = null

            if (isFriday) {
                prayerName = "jummah"
            }

            switch (prayerName) {
                case "terbit":
                    message = `**The sun** will rise in **${diffInMinutes} minutes**.`
                    break;

                case "imsak":
                    message = `**Imsak** will begin in **${diffInMinutes} minutes**.`
                    break;

                default:
                    message = `${capitalizeWords(prayerName)} prayer will begin in **${diffInMinutes} minutes**.`
                    break;
            }

            if (!message) return

            await this.sendMessage({ event, location, subscription, message })
        })

        sholatkuClient.on(PrayerEvent.PrayerIn15m, async (payload) => {
            const event = payload.event
            const location = payload.location
            const subscription = payload.subscription

            const isFriday = moment().day() === 5

            const diffInMinutes = event.time.diff(moment(), "minutes")

            let prayerName = event.eventName
            let message = null

            if (isFriday) {
                prayerName = "jummah"
            }

            switch (prayerName) {
                case "imsak":
                    message = `**Imsak** will begin in **${diffInMinutes} minutes**.`
                    break;

                case "maghrib":
                    message = `${capitalizeWords(prayerName)} prayer will begin in **${diffInMinutes} minutes**.`
                    break;
            }

            if (!message) return

            await this.sendMessage({ event, location, subscription, message })
        })
    }
}


