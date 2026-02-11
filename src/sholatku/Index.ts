import fs from "fs"
import moment from "moment-timezone"
import path from "path"
import { QuickDB } from "quick.db"
import { _dirname } from "../utils/Path.js"
import tags from "../utils/Tags.js"

const db = new QuickDB({ filePath: "db/prayerku.sqlite" })

const dataPath = path.join(_dirname, "..", "assets", "schedule.json")

const now = moment()
const id = "123"
const province = "D.I. Yogyakarta"
const city = "Kab. Gunungkidul"

type PrayerName = "imsak" | "subuh" | "terbit" | "dhuha" | "dzuhur" | "ashar" | "maghrib" | "isya"

interface PrayerTimeRaw {
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

interface PrayerTime {
    prayerName: PrayerName
    time: moment.Moment
}

async function getPrayerData() {
    let res = await fs.readFileSync(dataPath, "utf-8")
    const data: PrayerTimeRaw[] = JSON.parse(res) as PrayerTimeRaw[]

    return data
}

const data: PrayerTimeRaw[] = await getPrayerData()

function convertTimeToMoment(time: string) {
    const obj = moment(time, "HH:mm")

    return obj
}

function getPrayerTimesToday(): PrayerTime[] | null {
    const now = moment()
    const currentDay = now.format("d")
    const currentPrayerData = data.find((x) => x.tanggal == Number(currentDay))

    if (!currentPrayerData) {
        return null
    }

    const formatted: PrayerTime[] = Object.entries(currentPrayerData)
        .filter((x) => x[0] !== "tanggal")
        .map(([key, value]) => {
            return {
                prayerName: key as PrayerName,
                time: convertTimeToMoment(value)
            }
        })

    return formatted
}

const prayerToday = getPrayerTimesToday()!

for (let i = 0; i < prayerToday.length; i++) {
    const res = prayerToday[i];
    const next = prayerToday[i + 1]

    const now = moment("11:51", "HH:mm") // manual setting for simulation
    const prayerTime = res.time
    const nextPrayerTime: moment.Moment | undefined = next?.time

    console.log(`[${tags.Debug}] Checking ${res.prayerName} - ${res.time.format("HH:mm")}`)
    // current prayer time
    if (now.isAfter(prayerTime) && now.isBefore(nextPrayerTime)) {
        console.log(`Time for ${res.prayerName}`)

    }
    
    
    // next prayer in 5 minute
    const next5diff = nextPrayerTime?.diff(now, "minutes")

    if (next5diff <= 5 && next5diff > 0) {
        console.log(`5 Minutes into ${next.prayerName}`)
    }
}

function name() {
    
}