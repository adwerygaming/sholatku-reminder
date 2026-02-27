import EventEmitter from "events";
import { LocationSchema, SubscriptionSchema } from "../types/Database.types.js";
import { PrayerEvent } from "../types/Prayer.types.js";
import { CycleCheckEvent } from "./domain/PrayerScheduler.js";

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
export default sholatkuClient