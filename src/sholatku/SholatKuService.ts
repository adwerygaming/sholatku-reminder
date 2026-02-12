import axios from "axios"
import moment from "moment-timezone"
import DatabaseClient from "../database/DatabaseClient.js"
import { Imsakiyah, ImsakiyahResponse, PrayerName, PrayerTime } from "../types/PrayerTimeData.js"
import tags from "../utils/Tags.js"

interface CheckPrayerProps {
    province: string
    city: string,
    debugTime?: moment.Moment
}

type CheckPrayerEventName = "prayerTime" | "prayer_in_5m" | "prayer_in_15m" | "prayer_in_30m" | "nextPrayer"

interface CheckPrayerEvent {
    type: CheckPrayerEventName
    eventName: PrayerName
    time: moment.Moment
}

interface GetPrayerTimeDataProps {
    province: string
    city: string
}

interface UserInfo {
    createdAt: string
    province: string
    city: string
}

function PrayerState(province: string, city: string) {
    province = SholatKuService.Helper.normalize(province)
    city = SholatKuService.Helper.normalize(city)

    const now = moment()
    const dayIdentifier = now.format("DD_MM") // 11_03
    const db = DatabaseClient.table("prayer_state")

    const chain = {
        async Get(eventName: string): Promise<boolean> {
            const res = await db.get(`${province}.${city}.${dayIdentifier}.${eventName}`)

            return res ? true : false
        },
        async Set(eventName: string, value: boolean): Promise<void> {
            await db.set(`${province}.${city}.${dayIdentifier}.${eventName}`, value)
        }
    }

    return chain
}

function UserPrayerState(userId: string) {
    const now = moment()
    const dayIdentifier = now.format("DD_MM") // 11_03
    const db = DatabaseClient.table("user_prayer_state")

    const chain = {
        async Get(eventName: string): Promise<boolean> {
            const res = await db.get(`${userId}.${dayIdentifier}.${eventName}`)

            return res ? true : false
        },
        async Set(eventName: string, value: boolean): Promise<void> {
            await db.set(`${userId}.${dayIdentifier}.${eventName}`, value)
        }
    }

    return chain
}

function User(userId: string) {
    const db = DatabaseClient.table("users")

    const chain = {
        PrayerState: UserPrayerState(userId),

        async register(province: string, city: string): Promise<UserInfo> {
            const obj: UserInfo = {
                createdAt: moment().toISOString(),
                province,
                city
            }

            await db.set(`${userId}`, obj)
            return obj
        },

        async unregister(): Promise<void> {
            await db.delete(`${userId}`)
        },

        async getInfo(): Promise<UserInfo | null> {
            const res: UserInfo | null = await db.get(`${userId}`)
            return res
        },

        async updateInfo(province: string, city: string): Promise<UserInfo> {
            const res = await this.register(province, city)
            return res
        },

        async isRegistered(): Promise<boolean> {
            const res = await db.get(`${userId}`)
            return res ? true : false
        }
    }

    return chain
}

function PrayerData(province: string, city: string) {
    const db = DatabaseClient.table("prayer_data")
    let originalProvince = province
    let originalCity = city
    province = SholatKuService.Helper.normalize(province)
    city = SholatKuService.Helper.normalize(city)

    const chain = {
        async get(): Promise<Imsakiyah[] | null> {
            console.log(`[${tags.System}] Fetching prayer data FROM CACHE for ${city}, ${province}`)
            const res: Imsakiyah[] | null = await db.get(`${province}.${city}`)

            // plus do fetching
            if (!res) {
                const data = await SholatKuService.fetchPrayerData({ province: originalProvince, city: originalCity })

                if (data.length === 0 || !data || typeof data === "undefined") {
                    return null
                }

                await SholatKuService.Database.PrayerData(province, city).set(data)
                return data
            }

            return res
        },
        async set(data: Imsakiyah[]): Promise<void> {
            await db.set(`${province}.${city}`, data)
        }
    }

    return chain
}

const Database = {
    PrayerData,
    PrayerState,
    User
}

const Helper = {
    normalize(input: string): string {
        return input.replace(/[^a-zA-Z0-9]/g, "_")
    },
    convertTimeToMoment(time: string) {
        const obj = moment(time, "HH:mm")
        return obj
    },
}

const SholatKuService = {
    Database: Database,
    Helper: Helper,

    async fetchPrayerData({ city, province }: GetPrayerTimeDataProps): Promise<Imsakiyah[]> {
        console.log(`[${tags.System}] Fetching prayer data for ${city}, ${province}`)
        const url = `https://equran.id/api/v2/imsakiyah`
        const body = {
            provinsi: province,
            kabkota: city
        }

        const { data: res } = await axios.post<ImsakiyahResponse>(url, body, {
            validateStatus: () => true
        })

        const output = res?.data?.imsakiyah ?? []

        return output
    },

    getPrayerTimesToday(prayerData: Imsakiyah[]): PrayerTime[] | null {
        const now = moment()
        const currentDay = now.format("d")
        const currentPrayerData = prayerData.find((x) => x.tanggal == Number(currentDay))
    
        if (!currentPrayerData) {
            return null
        }
    
        const formatted: PrayerTime[] = Object.entries(currentPrayerData)
            .filter((x) => x[0] !== "tanggal")
            .map(([key, value]) => {
                return {
                    prayerName: key as PrayerName,
                    time: this.Helper.convertTimeToMoment(value)
                }
            })

        return formatted
    },

    async checkPrayer({ city, province, debugTime }: CheckPrayerProps): Promise<CheckPrayerEvent[] | null> {
        const prayerData = await this.Database.PrayerData(province, city).get()

        const now = debugTime ?? moment()

        if (!prayerData) {
            console.log(`[${tags.Error}] Failed to get prayer data for ${city}, ${province}`)
            return null
        }

        const prayerToday = this.getPrayerTimesToday(prayerData)

        if (!prayerToday) {
            console.log(`[${tags.Error}] Failed to get today's prayer times for ${city}, ${province}`)
            return null
        }

        let output: CheckPrayerEvent[] = []

        if (debugTime) {
            console.log(`[${tags.Debug}] Using Debug Time.`)
            console.log(`[${tags.Debug}] Current Time: ${debugTime.format("HH:mm")}`)
        }

        let currentIdx = -1

        const PrayerState = this.Database.PrayerState(province, city)

        for (let i = 0; i < prayerToday.length; i++) {
            const res = prayerToday[i];
            const next = prayerToday[i + 1]

            const now = debugTime ?? moment() // manual setting for simulation
            const prayerTime = res.time
            const nextPrayerTime: moment.Moment | undefined = next?.time

            if (!next) {
                break;
            }

            console.log(`[${tags.Debug}] Checking ${res.prayerName} - ${res.time.format("HH:mm")}`)

            // current prayer time
            const currentPrayerCheck = await PrayerState.Get(res.prayerName)

            if (now.isSameOrAfter(prayerTime) && now.isBefore(nextPrayerTime)) {
                if (!currentPrayerCheck) {
                    console.log(`Time for ${res.prayerName}`)
                    output.push({
                        type: "prayerTime",
                        eventName: res.prayerName,
                        time: prayerTime
                    })

                    await PrayerState.Set(res.prayerName, true)
                }

                console.log(`[${tags.Debug}] <= You are here =>`)
                currentIdx = i
            }

            const nextPrayerDiff = nextPrayerTime?.diff(now, "minutes")
            console.log(`[${tags.Debug}] Next Prayer ${next?.prayerName} is in ${nextPrayerDiff} minutes`)

            // next prayer in 5 minute
            const nextPrayerIn5DiffCheck = await PrayerState.Get(`${next?.prayerName}_5m`)

            if (nextPrayerDiff > 0 && nextPrayerDiff <= 5 && !nextPrayerIn5DiffCheck) {
                console.log(`5 Minutes into ${next?.prayerName}`)
                output.push({
                    type: "prayer_in_5m",
                    eventName: next.prayerName,
                    time: next.time
                })

                await PrayerState.Set(`${next.prayerName}_5m`, true)
            }

            // next prayer in 15 minute
            const nextPrayerIn15DiffCheck = await PrayerState.Get(`${next?.prayerName}_15m`)

            if (nextPrayerDiff > 5 && nextPrayerDiff <= 15 && !nextPrayerIn15DiffCheck) {
                console.log(`15 Minutes into ${next?.prayerName}`)
                output.push({
                    type: "prayer_in_15m",
                    eventName: next.prayerName,
                    time: next.time
                })

                await PrayerState.Set(`${next.prayerName}_15m`, true)
            }

            // next prayer in 30 minute
            const nextPrayerIn30DiffCheck = await PrayerState.Get(`${next?.prayerName}_30m`)

            if (nextPrayerDiff > 15 && nextPrayerDiff <= 30 && !nextPrayerIn30DiffCheck) {
                console.log(`30 Minutes into ${next?.prayerName}`)
                output.push({
                    type: "prayer_in_30m",
                    eventName: next.prayerName,
                    time: next.time
                })

                await PrayerState.Set(`${next.prayerName}_30m`, true)
            }
        }

        if ((currentIdx + 1) < prayerToday.length) {
            const nextPrayer = prayerToday[currentIdx + 1]
            console.log(`[${tags.Debug}] Next Prayer is ${nextPrayer.prayerName} at ${nextPrayer.time.from(now)}`)
            output.push({
                type: "nextPrayer",
                eventName: nextPrayer.prayerName,
                time: nextPrayer.time
            })
        }

        return output
    }
}

export default SholatKuService