import moment from "moment-timezone"
import { PrayerEvent, PrayerName } from "../../types/Prayer.types.js"
import tags from "../../utils/Tags.js"
import { PrayerData } from "./PrayerData.js"
import { PrayerState } from "./PrayerState.js"

export interface CycleCheckEvent {
    type: PrayerEvent
    eventName: PrayerName
    time: moment.Moment
}

/**
 * PrayerScheduler.
 * Also known as Root Sholatku Service 
 */
export class PrayerScheduler {
    private readonly prayerData: PrayerData
    private readonly prayerState: PrayerState
    private readonly province: string
    private readonly city: string
    private readonly debugTime: moment.Moment

    constructor(
        province: string,
        city: string,
        debugTime?: moment.Moment
    ) {
        this.prayerData = new PrayerData(province, city)
        this.prayerState = new PrayerState(province, city)
        this.province = province
        this.city = city
        this.debugTime = debugTime ?? moment()
    }

    async cycleCheck(): Promise<CycleCheckEvent[] | null> {
        const prayerDataResult = await this.prayerData.get()

        const now = this.debugTime ?? moment()

        if (!prayerDataResult) {
            console.log(`[${tags.Error}] Failed to get prayer data for ${this.city}, ${this.province}`)
            return null
        }

        const prayerToday = await this.prayerData.getTodayPrayerTimes()

        if (!prayerToday) {
            console.log(`[${tags.Error}] Failed to get today's prayer times for ${this.city}, ${this.province}`)
            return null
        }

        const output: CycleCheckEvent[] = []

        if (this.debugTime) {
            console.log(`[${tags.Debug}] Using Debug Time.`)
            console.log(`[${tags.Debug}] Current Time: ${this.debugTime.format("HH:mm")}`)
        }

        let currentIdx = -1

        console.log(`[${tags.Debug}] ${now.format("HH:mm:ss.mss")}`)

        for (let i = 0; i < prayerToday.length; i++) {
            const res = prayerToday[i];
            const next = prayerToday[i + 1]

            const now = this.debugTime ?? moment() // manual setting for simulation
            const prayerTime = res.time
            const nextPrayerTime: moment.Moment | undefined = next?.time

            if (!next) {
                break;
            }
            // console.log(`[${tags.Debug}] Checking ${res.prayerName} - ${res.time.format("HH:mm")}`)

            // current prayer time
            const currentPrayerCheck = await this.prayerState.get(res.prayerName)

            if (now.isSameOrAfter(prayerTime) && now.isBefore(nextPrayerTime)) {
                if (!currentPrayerCheck) {
                    console.log(`Time for ${res.prayerName}`)
                    output.push({
                        type: PrayerEvent.PrayerTime,
                        eventName: res.prayerName,
                        time: prayerTime
                    })

                    await this.prayerState.set(res.prayerName, true)
                }

                // console.log(`[${tags.Debug}] <= You are in this range =>`)
                currentIdx = i
            }

            const nextPrayerDiff = nextPrayerTime?.diff(now, "minutes")
            // console.log(`[${tags.Debug}] Next Prayer ${next?.prayerName} is in ${nextPrayerDiff} minutes`)

            // next prayer in 5 minute
            const nextPrayerIn5DiffCheck = await this.prayerState.get(`${next?.prayerName}_5m`)

            if (nextPrayerDiff > 0 && nextPrayerDiff <= 5 && !nextPrayerIn5DiffCheck) {
                console.log(`5 Minutes into ${next?.prayerName}`)
                output.push({
                    type: PrayerEvent.PrayerIn5m,
                    eventName: next.prayerName,
                    time: next.time
                })

                await this.prayerState.set(`${next.prayerName}_5m`, true)
            }

            // next prayer in 15 minute
            const nextPrayerIn15DiffCheck = await this.prayerState.get(`${next?.prayerName}_15m`)

            if (nextPrayerDiff > 5 && nextPrayerDiff <= 15 && !nextPrayerIn15DiffCheck) {
                console.log(`15 Minutes into ${next?.prayerName}`)
                output.push({
                    type: PrayerEvent.PrayerIn15m,
                    eventName: next.prayerName,
                    time: next.time
                })

                await this.prayerState.set(`${next.prayerName}_15m`, true)
            }

            // next prayer in 30 minute
            const nextPrayerIn30DiffCheck = await this.prayerState.get(`${next?.prayerName}_30m`)

            if (nextPrayerDiff > 15 && nextPrayerDiff <= 30 && !nextPrayerIn30DiffCheck) {
                console.log(`30 Minutes into ${next?.prayerName}`)
                output.push({
                    type: PrayerEvent.PrayerIn30m,
                    eventName: next.prayerName,
                    time: next.time
                })

                await this.prayerState.set(`${next.prayerName}_30m`, true)
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