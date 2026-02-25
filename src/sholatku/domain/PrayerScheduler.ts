import moment from "moment-timezone"
import { PrayerEvent, PrayerName, PrayerTime } from "../../types/Prayer.types.js"
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
    private readonly debugTime: moment.Moment | undefined = undefined

    constructor(
        province: string,
        city: string,
        debugTime?: moment.Moment
    ) {
        this.prayerData = new PrayerData(province, city)
        this.prayerState = new PrayerState(province, city)
        this.province = province
        this.city = city
        this.debugTime = debugTime
    }

    async cycleCheck(): Promise<CycleCheckEvent[] | null> {
        const prayerDataResult = await this.prayerData.get()
        const now = this.debugTime ?? moment()

        if (!prayerDataResult) {
            console.log(`[${tags.Error}] Failed to get prayer data for ${this.city}, ${this.province}`)
            return null
        }

        const prayerToday = await this.prayerData.getPrayerTimes(now)
        const tomorrow = now.clone().add(1, "day").startOf("day")
        const prayerTomorrow = await this.prayerData.getPrayerTimes(tomorrow)

        if (!prayerToday || !prayerTomorrow) {
            console.log(`[${tags.Error}] Failed to get prayer times`)
            return null
        }

        const output: CycleCheckEvent[] = []

        if (this.debugTime) {
            console.log(`[${tags.Debug}] Using Debug Time.`)
        }
        
        console.log(`[${tags.Debug}] ${now.format("HH:mm:ss.SSS")}`)

        let currentIdx = -1

        // Helper to get next prayer (handles rollover to tomorrow)
        const getNextPrayer = (idx: number): { prayer: PrayerTime, source: 'today' | 'tomorrow', isRollover: boolean } => {
            if (idx + 1 < prayerToday.length) {
                return {
                    prayer: prayerToday[idx + 1],
                    source: 'today',
                    isRollover: false
                }
            }

            return {
                prayer: prayerTomorrow[0],
                source: 'tomorrow',
                isRollover: true
            }
        }

        for (let i = 0; i < prayerToday.length; i++) {
            const current = prayerToday[i]
            const nextInfo = getNextPrayer(i)
            const next = nextInfo.prayer

            const prayerTime = current.time
            const nextPrayerTime = next.time

            // Check if we're in current prayer's time window
            const isLastPrayer = i === prayerToday.length - 1
            const isCurrentPrayerTime = isLastPrayer ? now.isSameOrAfter(prayerTime) : now.isSameOrAfter(prayerTime) && now.isBefore(nextPrayerTime)

            if (isCurrentPrayerTime) {
                const currentPrayerCheck = await this.prayerState.get(current.prayerName)
                if (!currentPrayerCheck) {
                    output.push({
                        type: PrayerEvent.PrayerTime,
                        eventName: current.prayerName,
                        time: prayerTime
                    })
                    await this.prayerState.set(current.prayerName, true)
                }
                currentIdx = i
            }

            // Calculate diff to next prayer (works for both today and tomorrow)
            const nextPrayerDiff = nextPrayerTime.diff(now, "minutes")
            const nextPrayerName = next.prayerName
            // const rolloverSuffix = nextInfo.isRollover ? ' (tomorrow)' : ''

            // 5 minute reminder
            const nextPrayerIn5DiffCheck = await this.prayerState.get(`${nextPrayerName}_5m`)
            if (nextPrayerDiff > 0 && nextPrayerDiff <= 5 && !nextPrayerIn5DiffCheck) {
                output.push({
                    type: PrayerEvent.PrayerIn5m,
                    eventName: nextPrayerName,
                    time: next.time
                })
                await this.prayerState.set(`${nextPrayerName}_5m`, true)
            }

            // 15 minute reminder
            const nextPrayerIn15DiffCheck = await this.prayerState.get(`${nextPrayerName}_15m`)
            if (nextPrayerDiff > 5 && nextPrayerDiff <= 15 && !nextPrayerIn15DiffCheck) {
                output.push({
                    type: PrayerEvent.PrayerIn15m,
                    eventName: nextPrayerName,
                    time: next.time
                })
                await this.prayerState.set(`${nextPrayerName}_15m`, true)
            }

            // 30 minute reminder
            const nextPrayerIn30DiffCheck = await this.prayerState.get(`${nextPrayerName}_30m`)
            if (nextPrayerDiff > 15 && nextPrayerDiff <= 30 && !nextPrayerIn30DiffCheck) {
                output.push({
                    type: PrayerEvent.PrayerIn30m,
                    eventName: nextPrayerName,
                    time: next.time
                })
                await this.prayerState.set(`${nextPrayerName}_30m`, true)
            }
        }

        if (currentIdx !== -1) {
            const nextInfo = getNextPrayer(currentIdx)
            const nextPrayer = nextInfo.prayer

            // console.log(`[${tags.Debug}] Next Prayer is ${nextPrayer.prayerName}${nextInfo.isRollover ? ' (tomorrow)' : ''} at ${nextPrayer.time.from(now)}`)

            output.push({
                type: PrayerEvent.NextPrayer,
                eventName: nextPrayer.prayerName,
                time: nextPrayer.time
            })
        } else {
            const firstPrayer = prayerToday[0]
            // console.log(`[${tags.Debug}] Next Prayer is ${firstPrayer.prayerName} at ${firstPrayer.time.from(now)}`)

            output.push({
                type: PrayerEvent.NextPrayer,
                eventName: firstPrayer.prayerName,
                time: firstPrayer.time
            })
        }

        return output
    }
}