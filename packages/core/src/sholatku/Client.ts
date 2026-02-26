import EventEmitter from "events";
import { LocationSchema, SubscriptionSchema } from "../types/Database.types.js";
import { PrayerEvent } from "../types/Prayer.types.js";
import tags from "../utils/Tags.js";
import { Location } from "./domain/Location.js";
import { CycleCheckEvent, PrayerScheduler } from "./domain/PrayerScheduler.js";
import { SubscriptionRepository } from "./domain/SubscriptionRepository.js";

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
    console.log(`[${tags.PrayerService}] No subscriptions found.`)
    return
  }

  for (const loc of subscribedLocations) {
    const scheduler = new PrayerScheduler(loc.id)
    const checks = await scheduler.cycleCheck()

    if (!checks) continue

    const subscribers = await subs.getByLocation(loc.id)

    for (const res of checks) {
      for (const sub of subscribers) {
        sholatkuClient.emit(res.type, {
          event: res,
          location: loc,
          subscription: sub,
        })
      }
    }
  }
}

await check()