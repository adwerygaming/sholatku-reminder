import moment, { Moment } from "moment-timezone";
import EventEmitter from "node:events";
import client from "../discord/Client.js";
import { PrayerEvent } from "../types/Prayer.types.js";
import { SholatkuUser, UserProvider } from "../types/Users.types.js";
import tags from "../utils/Tags.js";
import { Location } from "./domain/Location.js";
import { CycleCheckEvent, PrayerScheduler } from "./domain/PrayerScheduler.js";
import { UserAccount } from "./domain/UserAccount.js";
import { UserManager } from "./domain/UserManager.js";
import SholatKuServiceHelper from "./helper/Helper.js";

type PrayerEventPayload = {
    event: CycleCheckEvent;
    province: {
        searchKey: string;
        original: string;
        databaseKey: string;
    };
    city: {
        searchKey: string;
        original: string;
        databaseKey: string;
    };
    users: SholatkuUser[];
};

type EventMap = {
  [K in PrayerEvent]: PrayerEventPayload;
};

export class SholatKuEmitter extends EventEmitter {
  emit<K extends keyof EventMap>(
    event: K,
    payload: EventMap[K]
  ): boolean {
    return super.emit(event, payload);
  }

  on<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ): this {
    return super.on(event, listener);
  }
}

export const sholatKuEmitter = new SholatKuEmitter();

async function annouce(payload: PrayerEventPayload, message: string) {
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

        await channel.send({
            content: `${message ?? "sample text"}`
        })
    }
}

sholatKuEmitter.on(PrayerEvent.PrayerTime, async (payload) => {
    console.log(`[${tags.PrayerService}] Prayer Time Event for ${SholatKuServiceHelper.capitalizeWords(payload.event.eventName)} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);

    const eventName = payload.event.eventName
    const timeNow = moment().format("HH:mm:ss")
    const provinceName = payload.province.original
    const cityName = payload.city.original

    if (eventName == "terbit") {
        annouce(payload, `**The Sun has risen.**\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    } else if (eventName == "imsak") {
        annouce(payload, `Time for **Imsyakiyah**.\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    } else if (eventName == "dhuha") {
        annouce(payload, `**Dhuha** prayer has started.\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    } else {
        annouce(payload, `It's time for **${SholatKuServiceHelper.capitalizeWords(payload.event.eventName)}**\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    }
});

sholatKuEmitter.on(PrayerEvent.PrayerIn5m, async (payload) => {
    console.log(`[${tags.PrayerService}] Prayer In 5 Minutes Event for ${SholatKuServiceHelper.capitalizeWords(payload.event.eventName)} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);

    const eventName = payload.event.eventName
    const timeNow = moment().format("HH:mm:ss")
    const provinceName = payload.province.original
    const cityName = payload.city.original

    if (eventName == "terbit") {
        annouce(payload, `**The Sun will rise in 5 minutes at ${payload.event.time.format("HH:mm")}.**\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    } else if (eventName == "imsak") {
        annouce(payload, `**Imsyakiyah** will begin in 5 minutes at ${payload.event.time.format("HH:mm")}.\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    } else {
        annouce(payload, `**${SholatKuServiceHelper.capitalizeWords(payload.event.eventName)}** prayer will start in 5 minutes at ${payload.event.time.format("HH:mm:ss")}\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    }
});

sholatKuEmitter.on(PrayerEvent.PrayerIn15m, async (payload) => {
    console.log(`[${tags.PrayerService}] Prayer In 15 Minutes Event for ${SholatKuServiceHelper.capitalizeWords(payload.event.eventName)} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);

    const eventName = payload.event.eventName
    const timeNow = moment().format("HH:mm:ss")
    const provinceName = payload.province.original
    const cityName = payload.city.original

    if (eventName == "terbit") {
        return
    } else if (eventName == "imsak") {
        annouce(payload, `**Imsyakiyah** will begin in 15 minutes at ${payload.event.time.format("HH:mm")}.\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    } else {
        annouce(payload, `**${SholatKuServiceHelper.capitalizeWords(payload.event.eventName)}** prayer will start in 15 minutes at ${payload.event.time.format("HH:mm:ss")}\n-# ${provinceName}, ${cityName} - ${timeNow}`)
    }
});

sholatKuEmitter.on(PrayerEvent.PrayerIn30m, async (payload) => {
    console.log(`[${tags.PrayerService}] Prayer In 30 Minutes Event for ${SholatKuServiceHelper.capitalizeWords(payload.event.eventName)} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);
});

// await DatabaseClient.table("users").deleteAll()
// await DatabaseClient.table("prayer_state").deleteAll()
// await DatabaseClient.table("user_prayer_state").deleteAll()

// const provTest = "yogya"
// const cityTest = "gunung"

// const provRes = await SholatKuService.Database.Location.searchProvince(provTest)
// console.log("Province Search Result:", provRes)
// const cityRes = await SholatKuService.Database.Location.searchCity(provRes?.original ?? provTest, cityTest)
// console.log("City Search Result:", cityRes)

setInterval(async () => {
    await check()
}, 5000);

await check()

async function check() {
    let debugTime: Moment | undefined
    const useDebugTime = false

    if (useDebugTime) {
        debugTime = moment("11:50", "HH:mm")
    }

    const user = new UserManager()

    const users = await user.getAll()
    const usersMap = new Map<string, SholatkuUser[]>()

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const province = user.location?.province
        const city = user.location?.city

        if (!province || !city) continue;

        const locationKey = `${province}-${city}`

        if (!usersMap.has(locationKey)) {
            usersMap.set(locationKey, [])
        }

        usersMap.get(locationKey)!.push(user)
    }

    const thing = [...usersMap.entries()]

    for (let i = 0; i < thing.length; i++) {
        const res = thing[i];
        const locationKeyRaw = res[0]
        const users = res[1]

        const [province, city] = locationKeyRaw.split("-")

        if (!province || !city) continue;

        const prayerScheduler = new PrayerScheduler(province, city, debugTime)
        const location = new Location()

        const check = await prayerScheduler.cycleCheck()

        if (!check) continue;

        const provinceFinal = await location.searchProvince(province)
        const cityFinal = await location.searchCity(provinceFinal.original, city)

        for (let k = 0; k < check.length; k++) {
            const event = check[k];

            if (!event) continue;

            await sholatKuEmitter.emit(event.type, {
                event,
                province: {
                    databaseKey: province,
                    original: provinceFinal.original,
                    searchKey: provinceFinal.searchKey
                },
                city: {
                    databaseKey: city,
                    original: cityFinal.original,
                    searchKey: cityFinal.searchKey
                },
                users
            })
            // leave to this thing to update the last state
            for (let j = 0; j < users.length; j++) {
                const user = users[j];
                const userAccount = new UserAccount(user)

                const key = `${event.type}-${event.eventName}`
                const stateCheck = await userAccount.getPrayerState(key)

                if (event.type == "prayerTime" && !stateCheck) {
                    await userAccount.setPrayerState(key, true)
                } else if (event.type == "prayer_in_15m" && !stateCheck) {
                    await userAccount.setPrayerState(key, true)
                } else if (event.type == "prayer_in_30m" && !stateCheck) {
                    await userAccount.setPrayerState(key, true)
                }
            }
        }
    }
}