import moment from "moment-timezone";
import client from "../discord/Client.js";
import { PrayerEvent } from "../types/Prayer.types.js";
import { UserProvider } from "../types/Users.types.js";
import tags from "../utils/Tags.js";
import { PrayerEventPayload, sholatkuClient } from "./Client.js";
import { capitalizeWords } from "./helper/Helper.js";

async function annouce(payload: PrayerEventPayload, message: string): Promise<void> {
    // const users: SholatkuUser[] = payload.users.map((u) => u)
    const providerTYpe = payload.users[0].provider

    if (providerTYpe == UserProvider.Discord) {
        // send discord message to user
        const guilds = await client.guilds.fetch();
        const guildId = "598412465750933504"
        const guild = await guilds.get(guildId)?.fetch();

        if (!guild) {
            console.log(`[${tags.Debug}] Cannot find guild with ID ${guildId}`);
            return
        }

        const channels = await guild.channels.fetch();
        const channelId = "1471750280713601116"
        const channel = await channels.get(channelId)?.fetch();

        if (!channel || !channel.isTextBased()) {
            console.log(`[${tags.Debug}] Cannot find text channel with ID ${channelId}`);
            return
        }

        const timeNow = moment().format("HH:mm:ss")
        const provinceName = payload.province.original
        const cityName = payload.city.original

        message = `${message}\n-# ${provinceName}, ${cityName} - ${timeNow}`

        await channel.send({
            content: `${message ?? "sample text"}`
        })
    }
}

sholatkuClient.on(PrayerEvent.PrayerTime, async (payload) => {
    console.log(`[${tags.PrayerService}] Prayer Time Event for ${capitalizeWords(payload.event.eventName)} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);

    let eventName = payload.event.eventName
    const dayName = moment().tz("Asia/Jakarta").locale("en").format("dddd")?.toLowerCase()

    if (eventName == "terbit") {
        annouce(payload, `**The Sun has risen.**`)
    } else if (eventName == "imsak") {
        annouce(payload, `Time for **Imsyakiyah**.`)
    } else if (eventName == "dhuha") {
        annouce(payload, `**Dhuha** prayer has started.`)
    } else {
        if (dayName == "friday" && eventName == "dzuhur") {
            eventName = "jummah"
        }
        
        annouce(payload, `It's time for **${capitalizeWords(payload.event.eventName)}**`)
    }
});

sholatkuClient.on(PrayerEvent.PrayerIn5m, async (payload) => {
    console.log(`[${tags.PrayerService}] Prayer In 5 Minutes Event for ${capitalizeWords(payload.event.eventName)} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);

    let eventName = payload.event.eventName
    const dayName = moment().tz("Asia/Jakarta").locale("en").format("dddd")?.toLowerCase()

    if (eventName == "terbit") {
        annouce(payload, `**The Sun will rise in 5 minutes at ${payload.event.time.format("HH:mm")}.**`)
    } else if (eventName == "imsak") {
        annouce(payload, `**${capitalizeWords(payload.event.eventName)}** will begin in 5 minutes at ${payload.event.time.format("HH:mm")}.`)
    } else {
        if (dayName == "friday" && eventName == "dzuhur") {
            eventName = "jummah"
        }

        annouce(payload, `**${capitalizeWords(payload.event.eventName)}** prayer will start in 5 minutes at ${payload.event.time.format("HH:mm:ss")}`)
    }
});

sholatkuClient.on(PrayerEvent.PrayerIn15m, async (payload) => {
    console.log(`[${tags.PrayerService}] Prayer In 15 Minutes Event for ${capitalizeWords(payload.event.eventName)} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);

    let eventName = payload.event.eventName
    const dayName = moment().tz("Asia/Jakarta").locale("en").format("dddd")?.toLowerCase()

    if (eventName == "terbit") {
        return
    } else if (eventName == "imsak") {
        annouce(payload, `**${capitalizeWords(payload.event.eventName)}** will begin in 15 minutes at ${payload.event.time.format("HH:mm")}.`)
    } else {
        if (dayName == "friday" && eventName == "dzuhur") {
            eventName = "jummah"
        }

        annouce(payload, `**${capitalizeWords(payload.event.eventName)}** prayer will start in 15 minutes at ${payload.event.time.format("HH:mm:ss")}`)
    }
});

sholatkuClient.on(PrayerEvent.PrayerIn30m, async (payload) => {
    console.log(`[${tags.PrayerService}] Prayer In 30 Minutes Event for ${capitalizeWords(payload.event.eventName)} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);

    let eventName = payload.event.eventName
    const dayName = moment().tz("Asia/Jakarta").locale("en").format("dddd")?.toLowerCase()

    if (dayName == "friday" && eventName == "dzuhur") {
        eventName = "jummah"
    }

    if (eventName == "imsak") {
        annouce(payload, `**${capitalizeWords(payload.event.eventName)}** will begin in 30 minutes at ${payload.event.time.format("HH:mm")}.`)
    } else if (eventName == "maghrib" || eventName == "jummah") {
        annouce(payload, `**${capitalizeWords(payload.event.eventName)}** prayer will begin in 30 minutes at ${payload.event.time.format("HH:mm")}.`)
    }
});
