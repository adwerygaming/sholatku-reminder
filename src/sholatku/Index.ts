import moment from "moment-timezone";
import EventEmitter from "node:events";
import DatabaseClient from "../database/DatabaseClient.js";
import { PrayerEvent, SholatkuUser } from "../types/SholatKu.types.js";
import SholatKuService, { CheckPrayerEvent } from "./service/SholatKu.service.js";

type PrayerEventPayload = {
  event: CheckPrayerEvent;
  province: string;
  city: string;
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

sholatKuEmitter.on(PrayerEvent.PrayerTime, async (payload) => {
    console.log(`[Emitter] Prayer Time Event for ${payload.event.eventName} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);
});

sholatKuEmitter.on(PrayerEvent.PrayerIn5m, async (payload) => {
    console.log(`[Emitter] Prayer In 5 Minutes Event for ${payload.event.eventName} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);
});

sholatKuEmitter.on(PrayerEvent.PrayerIn15m, async (payload) => {
    console.log(`[Emitter] Prayer In 15 Minutes Event for ${payload.event.eventName} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);
});

sholatKuEmitter.on(PrayerEvent.PrayerIn30m, async (payload) => {
    console.log(`[Emitter] Prayer In 30 Minutes Event for ${payload.event.eventName} in ${payload.city}, ${payload.province} for users: ${payload.users.map(u => u.id).join(", ")}`);
});

await DatabaseClient.table("users").deleteAll()
await DatabaseClient.table("prayer_state").deleteAll()
await DatabaseClient.table("user_prayer_state").deleteAll()

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
    const debugTime = moment("11:50", "HH:mm")

    const users = await SholatKuService.User().getAll()
    const meong = new Map<string, SholatkuUser[]>()

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const province = user.location?.province
        const city = user.location?.city

        if (!province || !city) continue;

        const locationKey = `${province}-${city}`

        if (!meong.has(locationKey)) {
            meong.set(locationKey, [])
        }

        meong.get(locationKey)!.push(user)
    }

    const thing = [...meong.entries()]

    for (let i = 0; i < thing.length; i++) {
        const res = thing[i];
        const locationKeyRaw = res[0]
        const users = res[1]

        const [province, city] = locationKeyRaw.split("-")

        if (!province || !city) continue;

        const check = await SholatKuService.checkPrayer({ province, city, debugTime })

        if (!check) continue;

        for (let k = 0; k < check.length; k++) {
            const event = check[k];

            if (!event) continue;

            // do whatever with the event
            await sholatKuEmitter.emit(event.type, {
                event,
                province,
                city,
                users
            })

            // leave to this thing to update the last state
            for (let j = 0; j < users.length; j++) {
                const userId = users[j];
                const user = SholatKuService.User(userId)

                const key = `${event.type}-${event.eventName}`
                const stateCheck = await user.PrayerState.get(key)

                if (event.type == "prayerTime" && !stateCheck) {
                    await user.PrayerState.set(key, true)
                } else if (event.type == "prayer_in_15m" && !stateCheck) {
                    await user.PrayerState.set(key, true)
                } else if (event.type == "prayer_in_30m" && !stateCheck) {
                    await user.PrayerState.set(key, true)
                }

            }
        }
    }
}