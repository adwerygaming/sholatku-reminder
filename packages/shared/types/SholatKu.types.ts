import { CycleCheckEvent } from "sholatku-reminder-core/src/sholatku/domain/PrayerScheduler.js"
import { LocationSchema, SubscriptionSchema } from "./Database.types.js"

export interface DatabaseRawSchema<D> {
    id: string
    value: D
}

export type PrayerName = "imsak" | "subuh" | "terbit" | "dhuha" | "dzuhur" | "jummah" | "ashar" | "maghrib" | "isya"

/**
 * RAW Response from API, Still containing code, message and data.
 */
export interface APIResponse {
  code: number
  message: string
  data: APIResponseData
}

/**
 * Data field from API response.
 */
export interface APIResponseData {
  provinsi: string
  kabkota: string
  hijriah: string
  masehi: string
  imsakiyah: PrayerTimeData[] 
}

/**
 * Prayer time data for a single day, containing prayer times and date information.
 * previously known as Imsakiyah
 */
export interface PrayerTimeData {
  tanggal: number
  imsak: string
  subuh: string
  terbit: string
  dhuha: string
  dzuhur: string
  jummah?: string
  ashar: string
  maghrib: string
  isya: string
}

export interface PrayerTime {
    prayerName: PrayerName
    time: moment.Moment
}

/**
 * Known prayer events types, like prayerTime, in 5m, in 15m, in 30m, and next prayer.
 */
export enum PrayerEvent {
  PrayerTime = "prayerTime",
  PrayerIn5m = "prayer_in_5m",
  PrayerIn15m = "prayer_in_15m",
  PrayerIn30m = "prayer_in_30m",
  NextPrayer = "nextPrayer",
}

export type PrayerEventPayload = {
    event: CycleCheckEvent;
    location: LocationSchema;
    subscription: SubscriptionSchema;
};

/**
 * Wire-safe version of CycleCheckEvent — moment.Moment becomes a string after JSON.stringify.
 * Use this when deserializing from Redis.
 */
export type SerializedCycleCheckEvent = Omit<CycleCheckEvent, "time"> & { time: string }

/**
 * Wire-safe version of PrayerEventPayload for Redis pub/sub.
 * Reconstruct into PrayerEventPayload by wrapping time with moment().
 */
export type SerializedPrayerEventPayload = Omit<PrayerEventPayload, "event"> & { event: SerializedCycleCheckEvent }
