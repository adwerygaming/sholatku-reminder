// Load sholatku modules (starts the check() loop)
import "./sholatku/Client.js";

// Exports for consumers (discord, whatsapp, etc.)
export { default as sholatkuClient } from "./sholatku/Client.js";
export type { PrayerEventPayload } from "./sholatku/Client.js";
export type { CycleCheckEvent } from "./sholatku/domain/PrayerScheduler.js";
export type { LocationSchema, SubscriptionSchema } from "./types/Database.types.js";
export { PrayerEvent } from "./types/Prayer.types.js";
export type { PrayerName, PrayerTime, PrayerTimeData } from "./types/Prayer.types.js";
export { SubscriptionProvider } from "./types/Subscription.types.js";