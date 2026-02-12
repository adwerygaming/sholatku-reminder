import axios from "axios"
import moment from "moment-timezone"
import DatabaseClient from "../database/DatabaseClient.js"
import { Imsakiyah, ImsakiyahResponse, PrayerName, PrayerTime } from "../types/PrayerTimeData.js"
import tags from "../utils/Tags.js"

interface UpdatePrayerProps {
    province: string
    city: string,
    debugTime?: moment.Moment
}

type UpdatePrayerEventName = "prayerTime" | "prayer_in_5m" | "prayer_in_15m" | "prayer_in_30m"

interface UpdatePrayerEvent {
    type: UpdatePrayerEventName
    eventName: PrayerName
    time: moment.Moment
}

interface GetPrayerTimeDataProps {
    province: string
    city: string
}

function PrayerState() {
    const now = moment()
    const dayIdentifier = now.format("dd_mm") // 11_03
    const db = DatabaseClient.table("prayer_state")


    const chain = {
        async Get(prayerName: string): Promise<boolean> {
            const res = await db.get(`${dayIdentifier}_${prayerName}`)

            return res ? true : false
        },
        async Set(prayerName: string, value: boolean): Promise<void> {
            await db.set(`${dayIdentifier}_${prayerName}`, value)
        }
    }

    return chain
}

function UserPrayerState() {
    const now = moment()
    const dayIdentifier = now.format("dd_mm") // 11_03
    const db = DatabaseClient.table("user_prayer_state")

    const chain = {
    }

    return chain
}

function PrayerData() {
    const db = DatabaseClient.table("prayer_data")

    const chain = {
        async get(province: string, city: string): Promise<Imsakiyah[] | null> {
            const res: Imsakiyah[] | null = await db.get(`${province}_${city}`)

            // plus do fetching
            if (!res) {
                const data = await SholatKuService.fetchPrayerData({ province, city })

                if (data.length === 0 || !data || typeof data === "undefined") {
                    return null
                }

                await this.set(province, city, data)
                return data
            }

            return res
        },
        async set(province: string, city: string, data: Imsakiyah[]): Promise<void> {
            await db.set(`${province}_${city}`, data)
        }
    }

    return chain
}

const Database = {
    PrayerData,
    PrayerState,
    UserPrayerState
}

const SholatKuService = {
    Database: Database,

    async fetchPrayerData({ city, province }: GetPrayerTimeDataProps): Promise<Imsakiyah[]> {
        const url = `https://equran.id/api/v2/imsakiyah`
        const body = {
            province,
            city
        }

        const { data: res } = await axios.post<ImsakiyahResponse>(url, body, {
            validateStatus: () => true
        })

        const output = res?.data?.imsakiyah ?? []

        return output
    },

    convertTimeToMoment(time: string) {
        const obj = moment(time, "HH:mm")
        return obj
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
                    time: this.convertTimeToMoment(value)
                }
            })

        return formatted
    },

    async updatePrayer({ city, province, debugTime }: UpdatePrayerProps): Promise<UpdatePrayerEvent[] | null> {
        const prayerData = await this.Database.PrayerData().get(province, city)

        if (!prayerData) {
            console.log(`[${tags.Error}] Failed to get prayer data for ${city}, ${province}`)
            return null
        }

        const prayerToday = this.getPrayerTimesToday(prayerData)

        if (!prayerToday) {
            console.log(`[${tags.Error}] Failed to get today's prayer times for ${city}, ${province}`)
            return null
        }

        let output: UpdatePrayerEvent[] = []

        for (let i = 0; i < prayerToday.length; i++) {
            const res = prayerToday[i];
            const next = prayerToday[i + 1]

            const now = debugTime ?? moment() // manual setting for simulation
            const prayerTime = res.time
            const nextPrayerTime: moment.Moment | undefined = next?.time

            console.log(`[${tags.Debug}] Checking ${res.prayerName} - ${res.time.format("HH:mm")}`)

            // current prayer time
            const currentPrayerCheck = SholatKuService.Database.PrayerState().Get(res.prayerName)

            if (now.isSameOrAfter(prayerTime) && now.isBefore(nextPrayerTime) && !currentPrayerCheck) {
                console.log(`Time for ${res.prayerName}`)
                output.push({
                    type: "prayerTime",
                    eventName: res.prayerName,
                    time: prayerTime
                })
            }

            const nextPrayerDiff = nextPrayerTime?.diff(now, "minutes")
            
            // next prayer in 5 minute
            const nextPrayerIn5DiffCheck = SholatKuService.Database.PrayerState().Get(`${next?.prayerName}_5m`)

            if (nextPrayerDiff <= 5 && nextPrayerDiff > 0 && !nextPrayerIn5DiffCheck) {
                console.log(`5 Minutes into ${next?.prayerName}`)
                output.push({
                    type: "prayer_in_5m",
                    eventName: next.prayerName,
                    time: next.time
                })
            }

            // next prayer in 15 minute
            const nextPrayerIn15DiffCheck = SholatKuService.Database.PrayerState().Get(`${next?.prayerName}_15m`)

            if (nextPrayerDiff <= 15 && nextPrayerDiff > 0 && !nextPrayerIn15DiffCheck) {
                console.log(`15 Minutes into ${next?.prayerName}`)
                output.push({
                    type: "prayer_in_15m",
                    eventName: next.prayerName,
                    time: next.time
                })
            }

            // next prayer in 30 minute
            const nextPrayerIn30DiffCheck = SholatKuService.Database.PrayerState().Get(`${next?.prayerName}_30m`)

            if (nextPrayerDiff <= 30 && nextPrayerDiff > 0 && !nextPrayerIn30DiffCheck) {
                console.log(`30 Minutes into ${next?.prayerName}`)
                output.push({
                    type: "prayer_in_30m",
                    eventName: next.prayerName,
                    time: next.time
                })
            }
        }

        return output
    }
}

export default SholatKuService