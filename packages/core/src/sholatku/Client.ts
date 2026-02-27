import EventEmitter from "events";
import tags from "sholatku-reminder-shared/utils/Tags.js";
import { LocationSchema, SubscriptionSchema } from "../types/Database.types.js";
import { PrayerEvent } from "../types/Prayer.types.js";
import { SubscriptionProvider } from "../types/Subscription.types.js";
import { Location } from "./domain/Location.js";
import { CycleCheckEvent, PrayerScheduler } from "./domain/PrayerScheduler.js";
import { SubscriptionRepository } from "./domain/SubscriptionRepository.js";
import { SubscriptionState } from "./domain/SubscriptionState.js";

export type PrayerEventPayload = {
    event: CycleCheckEvent;
    location: LocationSchema;
    subscription: SubscriptionSchema;
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

const sholatkuClient = new SholatKuEmitter();

console.log(`[${tags.PrayerService}] Loaded SholatKu Client.`);

export default sholatkuClient

async function check(): Promise<void> {
  const location = new Location()
  const subs = new SubscriptionRepository()

  const subscribedLocations = await location.getSubscribedLocations()

  if (subscribedLocations.length === 0) {
    console.log(`[${tags.Error}] No subscriptions found. Adding dumy data`)

    const locky = await location.getByLocation({
      province: "D.I. Yogyakarta",
      city: "Kab. Gunungkidul"
    })

    if (!locky) {
      console.log(`[${tags.Error}] Locky not found.`)
      return
    }

    await subs.register({
      locationId: locky.id,
      providerName: SubscriptionProvider.Discord,
      metadata: {
        authorId: "506108777343352881",
        channelId: "1471750280713601116",
        guildId: "598412465750933504"
      }
    })
    return
  }

  for (const loc of subscribedLocations) {
    const scheduler = new PrayerScheduler(loc.id)
    const checks = await scheduler.cycleCheck()

    if (!checks) continue

    const subscribers = await subs.getByLocation(loc.id)

    // for (const sub of subscribers) {
    //   console.log(`[${tags.Debug}] ${sub.providerName}`)
    //   console.log(sub.metadata)
    //   console.log(loc)
    // }

    for (const res of checks) {
      for (const sub of subscribers) {
        sholatkuClient.emit(res.type, {
          event: res,
          location: loc,
          subscription: sub,
        })

        const subState = new SubscriptionState(sub.id)

        const stateCheck = await subState.get({
          prayerName: res.eventName,
          prayerType: res.type,
          date: res.time.toDate()
        })

        if (res.type == PrayerEvent.PrayerTime && !stateCheck) {
          await subState.set({
            prayerName: res.eventName,
            prayerType: res.type,
            date: res.time.toDate(),
            value: true
          })
        } else if (res.type == PrayerEvent.PrayerIn5m) {
          await subState.set({
            prayerName: res.eventName,
            prayerType: res.type,
            date: res.time.toDate(),
            value: true
          })
        } else if (res.type == PrayerEvent.PrayerIn15m) {
          await subState.set({
            prayerName: res.eventName,
            prayerType: res.type,
            date: res.time.toDate(),
            value: true
          })
        } else if (res.type == PrayerEvent.PrayerIn30m) {
          await subState.set({
            prayerName: res.eventName,
            prayerType: res.type,
            date: res.time.toDate(),
            value: true
          })
        }
      }
    }
  }
}

await check()
setInterval(() => void check(), 3 * 1000)