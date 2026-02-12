export interface ImsakiyahResponse {
  code: number
  message: string
  data: PrayerData
}

export interface PrayerData {
  provinsi: string
  kabkota: string
  hijriah: string
  masehi: string
  imsakiyah: Imsakiyah[]
}

export interface Imsakiyah {
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

export type PrayerName = "imsak" | "subuh" | "terbit" | "dhuha" | "dzuhur" | "ashar" | "maghrib" | "isya"

export interface PrayerTimeRaw {
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