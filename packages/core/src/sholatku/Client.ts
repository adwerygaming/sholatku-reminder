import { SholatkuUser } from "../types/Subscription.types.js";

import EventEmitter from "events";
import { PrayerEvent } from "../types/Prayer.types.js";
import tags from "../utils/Tags.js";
import { CycleCheckEvent } from "./domain/PrayerScheduler.js";

export type PrayerEventPayload = {
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

const sholatkuClient = new SholatKuEmitter();

console.log(`[${tags.PrayerService}] Loaded SholatKu Client.`);

export default sholatkuClient