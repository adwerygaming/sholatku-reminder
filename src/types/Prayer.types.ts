export type PrayerName = "imsak" | "subuh" | "terbit" | "dhuha" | "dzuhur" | "ashar" | "maghrib" | "isya"

export interface APIResponse {
  code: number
  message: string
  data: APIResponseData
}

export interface APIResponseData {
  provinsi: string
  kabkota: string
  hijriah: string
  masehi: string
  imsakiyah: PrayerTimeData[] 
}

// previously Imsakiyah
export interface PrayerTimeData {
  tanggal: number
  imsak: string
  subuh: string
  terbit: string
  dhuha: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
}

export interface PrayerTime {
    prayerName: PrayerName
    time: moment.Moment
}

export enum PrayerEvent {
  PrayerTime = "prayerTime",
  PrayerIn5m = "prayer_in_5m",
  PrayerIn15m = "prayer_in_15m",
  PrayerIn30m = "prayer_in_30m",
  NextPrayer = "nextPrayer",
}