import EventEmitter from "events";
import { PrayerEvent } from "../types/Prayer.types.js";
import tags from "../utils/Tags.js";
import { CycleCheckEvent } from "./domain/PrayerScheduler.js";
import { SubscriptionRepository } from "./domain/SubscriptionRepository.js";

export type PrayerEventPayload = {
    event: CycleCheckEvent;
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
  // const location = new Location();
  const subs = new SubscriptionRepository()

  const locations = await subs.fetchAllLocations()

  console.log(locations)
}

await check()