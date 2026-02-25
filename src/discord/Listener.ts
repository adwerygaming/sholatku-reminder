import moment from "moment-timezone";
import sholatkuClient, { PrayerEventPayload } from "../sholatku/Client.js";
import { PrayerEvent } from "../types/Prayer.types.js";
import tags from "../utils/Tags.js";

import { Colors, ContainerBuilder, MessageFlags } from "discord.js";
import { capitalizeWords } from "../sholatku/helper/Helper.js";
import client from "./Client.js";

interface DiscordListenerOptions {
    guildId?: string;
    channelId?: string;
}

export class DiscordListener {
    private readonly guildId: string | undefined
    private readonly channelId: string | undefined

    constructor ({
        guildId,
        channelId
    }: DiscordListenerOptions) {
        this.guildId = guildId
        this.channelId = channelId
        console.log(`[${tags.Discord}] Loaded Discord Listener Script.`)
    }

    private async sendMessage(payload: PrayerEventPayload, message: string): Promise<void> {
        const isDiscordUser = payload.users.some(u => u.provider == "discord")
        if (!isDiscordUser) return

        if (!this.guildId) {
            console.log(`[${tags.Discord}] Guild ID is not set. Cannot send message to Discord.`)
            return
        }

        if (!this.channelId) {
            console.log(`[${tags.Discord}] Channel ID is not set. Cannot send message to Discord.`)
            return
        }

        const guilds = await client.guilds.fetch();
        const guild = await guilds.get(this.guildId)?.fetch();

        if (!guild) {
            console.log(`[${tags.Discord}] Cannot find guild with ID ${this.guildId}`);
            return
        }

        const channels = await guild.channels.fetch();
        const channel = await channels.get(this.channelId)?.fetch();

        if (!channel?.isTextBased()) {
            console.log(`[${tags.Discord}] Provided channel is not a text channel. Cannot send message to Discord.`);
            return
        }

        const footer = `-# ${capitalizeWords(payload.province.original)}, ${capitalizeWords(payload.city.original)} - ${moment().format("HH:mm:ss")}`

        try {
            const messageContainer = new ContainerBuilder()
                .setAccentColor(Colors.Blurple)
                .addTextDisplayComponents(
                    text => text.setContent(message)
                )
                .addTextDisplayComponents(
                    text => text.setContent(footer)
                )

            await channel.send({
                components: [messageContainer],
                flags: [MessageFlags.IsComponentsV2]
            })
        } catch (e) {
            console.log(`[${tags.Error}] Failed to send message to Discord: ${e}`);
        }
    }

    async listen(): Promise<void> {
        console.log(`[${tags.Discord}] Started listening to Sholatku events.`)

        // Prayer Time Event
        sholatkuClient.on(PrayerEvent.PrayerTime, async (payload) => {
            let eventName = payload.event.eventName
            const dayName = moment().tz("Asia/Jakarta").locale("en").format("dddd")?.toLowerCase()
            
            let message: string | null = null

            switch (eventName) {
                case "imsak":
                    message = `Time for **Imsyakiyah**.`
                    break;

                case "terbit": 
                    message = `**The Sun has risen.**`
                    break;

                case "dhuha":
                    message = `**Dhuha** prayer has started.`
                    break;
            
                default:
                    if (dayName == "friday" && eventName == "dzuhur") {
                        eventName = "jummah"
                    }

                    message = `Time for **${capitalizeWords(eventName)}** prayer.`
                    break;
            }

            await this.sendMessage(payload, message)
        })

        sholatkuClient.on(PrayerEvent.PrayerIn5m, async (payload) => {
            let eventName = payload.event.eventName
            const eventTime = payload.event.time.format("HH:mm")
            const dayName = moment().tz("Asia/Jakarta").locale("en").format("dddd")?.toLowerCase()
            
            let message: string | null = null

            switch (eventName) {
                case "imsak":
                    message = `**Imsyakiyah** will begin in **5 minutes** at ${eventTime}.`
                    break;

                case "terbit":
                    message = `**The sun will rise in 5 minutes** at ${eventTime}.`
                    break;

                case "dhuha":
                    message = `**Dhuha** prayer will start in 5 minutes at ${eventTime}.`
                    break;

                default:
                    if (dayName == "friday" && eventName == "dzuhur") {
                        eventName = "jummah"
                    }

                    message = `**${capitalizeWords(eventName)}** prayer will start in **5 minutes**.`
                    break;
            }

            await this.sendMessage(payload, message)
        })

        sholatkuClient.on(PrayerEvent.PrayerIn15m, async (payload) => {
            let eventName = payload.event.eventName
            const eventTime = payload.event.time.format("HH:mm")
            const dayName = moment().tz("Asia/Jakarta").locale("en").format("dddd")?.toLowerCase()
            
            let message: string | null = null

            switch (eventName) {
                case "imsak":
                    message = `**Imsyakiyah** will begin in **15 minutes** at ${eventTime}.`
                    break;

                case "terbit":
                    message = `**The sun will rise in 15 minutes** at ${eventTime}.`
                    break;

                case "dhuha":
                    message = `**Dhuha** prayer will start in 15 minutes at ${eventTime}.`
                    break;

                default:
                    if (dayName == "friday" && eventName == "dzuhur") {
                        eventName = "jummah"
                    }

                    message = `**${capitalizeWords(eventName)}** prayer will start in **15 minutes**.`
                    break;
            }

            await this.sendMessage(payload, message)
        })

        sholatkuClient.on(PrayerEvent.PrayerIn30m, async (payload) => {
            const eventName = payload.event.eventName
            const eventTime = payload.event.time.format("HH:mm")
            // const dayName = moment().tz("Asia/Jakarta").locale("en").format("dddd")?.toLowerCase()
            
            let message: string | null = null

            switch (eventName) {
                case "imsak":
                    message = `**Imsyakiyah** will begin in **30 minutes** at ${eventTime}.`
                    break;

                case "maghrib":
                    message = `**${capitalizeWords(eventName)}** prayer will start in 30 minutes at ${eventTime}.`
                    break;

                default:
                    break;
            }

            if (!message) return

            await this.sendMessage(payload, message)
        })
    }
}