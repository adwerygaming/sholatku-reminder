import axios from "axios"
import moment from "moment-timezone"
import DatabaseClient from "../../database/DatabaseClient.js"
import { Imsakiyah, ImsakiyahResponse, PrayerName, PrayerTime } from "../../types/Prayer.types.js"
import { BaseLocation, PrayerEvent } from "../../types/SholatKu.types.js"
import tags from "../../utils/Tags.js"
import SholatKuServiceDatabase from "./database/Database.js"
import SholatKuServiceHelper from "./helper/Helper.js"
import { SholatKuServiceUser } from "./user/UserAccount.js"

export interface CheckPrayerProps extends BaseLocation {
    debugTime?: moment.Moment
}

export interface CheckPrayerEvent {
    type: PrayerEvent
    eventName: PrayerName
    time: moment.Moment
}

const SholatKuService = {
    Database: SholatKuServiceDatabase,
    Helper: SholatKuServiceHelper,
    User: SholatKuServiceUser,

    Prayer: {
        async getLocations(): Promise<BaseLocation[]> {
            const usersRaw = await DatabaseClient.table("users").all()

            const locations: BaseLocation[] = usersRaw.map((x) => {
                return { province: x.value.province, city: x.value.city }
            }).filter((v, i, a) => a.findIndex(t => (t.province === v.province && t.city === v.city)) === i)

            return locations
        },

        async fetchPrayerData({ city, province }: BaseLocation): Promise<Imsakiyah[]> {
            const provinceFinal = await SholatKuService.Database.Location.searchProvince(province)
            const cityFinal = await SholatKuService.Database.Location.searchCity(provinceFinal?.original, city)

            const url = `https://equran.id/api/v2/imsakiyah`
            const body = {
                provinsi: provinceFinal.original,
                kabkota: cityFinal.original
            }

            console.log(`[${tags.System}] Fetching prayer data for ${body.provinsi}, ${body.kabkota}`)

            const { data: res } = await axios.post<ImsakiyahResponse>(url, body, {
                validateStatus: () => true
            })

            const output = res?.data?.imsakiyah ?? []

            return output
        },

        getTodayPrayerTimes(prayerData: Imsakiyah[]): PrayerTime[] | null {
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
                        time: SholatKuService.Helper.convertTimeToMoment(value)
                    }
                })

            return formatted
        },

        async checkPrayer({ city, province, debugTime }: CheckPrayerProps): Promise<CheckPrayerEvent[] | null> {
            const prayerData = await SholatKuService.Database.PrayerData(province, city).get()

            const now = debugTime ?? moment()

            if (!prayerData) {
                console.log(`[${tags.Error}] Failed to get prayer data for ${city}, ${province}`)
                return null
            }

            const prayerToday = SholatKuService.Prayer.getTodayPrayerTimes(prayerData)

            if (!prayerToday) {
                console.log(`[${tags.Error}] Failed to get today's prayer times for ${city}, ${province}`)
                return null
            }

            const output: CheckPrayerEvent[] = []

            if (debugTime) {
                console.log(`[${tags.Debug}] Using Debug Time.`)
                console.log(`[${tags.Debug}] Current Time: ${debugTime.format("HH:mm")}`)
            }

            let currentIdx = -1

            const PrayerState = SholatKuService.Database.PrayerState(province, city)

            console.log(`[${tags.Debug}] ${now.format("HH:mm:ss.mss")}`)

            for (let i = 0; i < prayerToday.length; i++) {
                const res = prayerToday[i];
                const next = prayerToday[i + 1]

                const now = debugTime ?? moment() // manual setting for simulation
                const prayerTime = res.time
                const nextPrayerTime: moment.Moment | undefined = next?.time

                if (!next) {
                    break;
                }

                // console.log(`[${tags.Debug}] Checking ${res.prayerName} - ${res.time.format("HH:mm")}`)

                // current prayer time
                const currentPrayerCheck = await PrayerState.get(res.prayerName)

                if (now.isSameOrAfter(prayerTime) && now.isBefore(nextPrayerTime)) {
                    if (!currentPrayerCheck) {
                        console.log(`Time for ${res.prayerName}`)
                        output.push({
                            type: PrayerEvent.PrayerTime,
                            eventName: res.prayerName,
                            time: prayerTime
                        })

                        await PrayerState.set(res.prayerName, true)
                    }

                    // console.log(`[${tags.Debug}] <= You are in this range =>`)
                    currentIdx = i
                }

                const nextPrayerDiff = nextPrayerTime?.diff(now, "minutes")
                // console.log(`[${tags.Debug}] Next Prayer ${next?.prayerName} is in ${nextPrayerDiff} minutes`)

                // next prayer in 5 minute
                const nextPrayerIn5DiffCheck = await PrayerState.get(`${next?.prayerName}_5m`)

                if (nextPrayerDiff > 0 && nextPrayerDiff <= 5 && !nextPrayerIn5DiffCheck) {
                    console.log(`5 Minutes into ${next?.prayerName}`)
                    output.push({
                        type: PrayerEvent.PrayerIn5m,
                        eventName: next.prayerName,
                        time: next.time
                    })

                    await PrayerState.set(`${next.prayerName}_5m`, true)
                }

                // next prayer in 15 minute
                const nextPrayerIn15DiffCheck = await PrayerState.get(`${next?.prayerName}_15m`)

                if (nextPrayerDiff > 5 && nextPrayerDiff <= 15 && !nextPrayerIn15DiffCheck) {
                    console.log(`15 Minutes into ${next?.prayerName}`)
                    output.push({
                        type: PrayerEvent.PrayerIn15m,
                        eventName: next.prayerName,
                        time: next.time
                    })

                    await PrayerState.set(`${next.prayerName}_15m`, true)
                }

                // next prayer in 30 minute
                const nextPrayerIn30DiffCheck = await PrayerState.get(`${next?.prayerName}_30m`)

                if (nextPrayerDiff > 15 && nextPrayerDiff <= 30 && !nextPrayerIn30DiffCheck) {
                    console.log(`30 Minutes into ${next?.prayerName}`)
                    output.push({
                        type: PrayerEvent.PrayerIn30m,
                        eventName: next.prayerName,
                        time: next.time
                    })

                    await PrayerState.set(`${next.prayerName}_30m`, true)
                }
            }

            if ((currentIdx + 1) < prayerToday.length) {
                const nextPrayer = prayerToday[currentIdx + 1]
                console.log(`[${tags.Debug}] Next Prayer is ${nextPrayer.prayerName} at ${nextPrayer.time.from(now)}`)
                output.push({
                    type: PrayerEvent.NextPrayer,
                    eventName: nextPrayer.prayerName,
                    time: nextPrayer.time
                })
            }

            return output
        }
    }
}

export default SholatKuService