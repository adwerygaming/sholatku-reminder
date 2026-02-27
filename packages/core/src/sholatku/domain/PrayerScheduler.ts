import moment from "moment-timezone"
import { LocationSchema } from "../../types/Database.types.js"
import { PrayerEvent, PrayerName, PrayerTime } from "../../types/Prayer.types.js"
import tags from "../../utils/Tags.js"
import { Location } from "./Location.js"
import { PrayerData } from "./PrayerData.js"
import { PrayerLocationState } from "./PrayerLocationState.js"

export interface CycleCheckEvent {
    type: PrayerEvent
    eventName: PrayerName
    time: moment.Moment
}

interface GetNextPrayerResult {
    prayer: PrayerTime,
    source: 'today' | 'tomorrow',
    isRollover: boolean
}

/**
 * PrayerScheduler.
 * Also known as Root Sholatku Service 
 */
export class PrayerScheduler {
    private readonly location = new Location()
    private readonly locationId: string
    private readonly prayerData: PrayerData
    private readonly prayerLocationState: PrayerLocationState
    private readonly debugTime: moment.Moment | undefined = undefined

    constructor(
        locationId: string,
        debugTime?: moment.Moment
    ) {
        this.locationId = locationId
        this.prayerData = new PrayerData(locationId)
        this.prayerLocationState = new PrayerLocationState(locationId)
        this.debugTime = debugTime
    }

    async resolveLocation(): Promise<LocationSchema | null> {
        const locationData = await this.location.getById(this.locationId)

        if (!locationData) {
            return null
        }

        return locationData
    }

    async cycleCheck(): Promise<CycleCheckEvent[] | null> {
        const prayerDataResult = await this.prayerData.get()
        const now = this.debugTime ?? moment()

        const locationData = await this.resolveLocation()
    
        if (!locationData) {
            console.log(`[${tags.Error}] Failed to resolve location for id ${this.locationId}`)
            return null
        }

        const city = locationData.city
        const province = locationData.province

        if (!prayerDataResult) {
            console.log(`[${tags.Error}] Failed to get prayer data for ${city}, ${province}. Found no results.`)
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
        
        console.log(`[${tags.Debug}] ${now.format("HH:mm:ss.SSS DD/MM")}`)

        let currentIdx = -1

        const getNextPrayer = (idx: number): GetNextPrayerResult => {
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

            // console.log(`[${tags.Debug}] Current prayer: ${current.prayerName} at ${prayerTime.format("HH:mm")}`)
            // console.log(`[${tags.Debug}] Next prayer: ${next.prayerName} at ${nextPrayerTime.format("HH:mm")} (${nextInfo.isRollover ? 'tomorrow' : 'today'})`)

            // Check if we're in current prayer's time window
            const isLastPrayer = i === prayerToday.length - 1
            const isCurrentPrayerTime = isLastPrayer ? now.isSameOrAfter(prayerTime) : now.isSameOrAfter(prayerTime) && now.isBefore(nextPrayerTime)

            if (isCurrentPrayerTime) {
                const currentPrayerCheck = await this.prayerLocationState.get({
                    prayerName: current.prayerName,
                    prayerType: PrayerEvent.PrayerTime
                })

                if (!currentPrayerCheck) {
                    output.push({
                        type: PrayerEvent.PrayerTime,
                        eventName: current.prayerName,
                        time: prayerTime
                    })

                    await this.prayerLocationState.set({
                        prayerName: current.prayerName,
                        prayerType: PrayerEvent.PrayerTime,
                        value: true
                    })
                }

                currentIdx = i
            }

            // Calculate diff to next prayer (works for both today and tomorrow)
            const nextPrayerDiff = nextPrayerTime.diff(now, "minutes")
            const nextPrayerName = next.prayerName
            // const rolloverSuffix = nextInfo.isRollover ? ' (tomorrow)' : ''

            // console.log(`[${tags.Debug}] Time until next prayer (${next.prayerName}): ${nextPrayerDiff > 0 ? `${nextPrayerDiff} minutes` : "Passed"}`)
            // console.log(`[${tags.Debug}] Current IDX: ${currentIdx}`)

            // 5 minute reminder
            const nextPrayerIn5DiffCheck = await this.prayerLocationState.get({
                prayerName: nextPrayerName,
                prayerType: PrayerEvent.PrayerIn5m
            })

            if (nextPrayerDiff > 0 && nextPrayerDiff <= 5 && !nextPrayerIn5DiffCheck) {
                output.push({
                    type: PrayerEvent.PrayerIn5m,
                    eventName: nextPrayerName,
                    time: next.time
                })

                await this.prayerLocationState.set({
                    prayerName: nextPrayerName,
                    prayerType: PrayerEvent.PrayerIn5m,
                    value: true
                })
            }

            // 15 minute reminder
            const nextPrayerIn15DiffCheck = await this.prayerLocationState.get({
                prayerName: nextPrayerName,
                prayerType: PrayerEvent.PrayerIn15m
            })

            if (nextPrayerDiff > 5 && nextPrayerDiff <= 15 && !nextPrayerIn15DiffCheck) {
                output.push({
                    type: PrayerEvent.PrayerIn15m,
                    eventName: nextPrayerName,
                    time: next.time
                })

                await this.prayerLocationState.set({
                    prayerName: nextPrayerName,
                    prayerType: PrayerEvent.PrayerIn15m,
                    value: true
                })
            }

            // 30 minute reminder
            const nextPrayerIn30DiffCheck = await this.prayerLocationState.get({
                prayerName: nextPrayerName,
                prayerType: PrayerEvent.PrayerIn30m
            })

            if (nextPrayerDiff > 15 && nextPrayerDiff <= 30 && !nextPrayerIn30DiffCheck) {
                output.push({
                    type: PrayerEvent.PrayerIn30m,
                    eventName: nextPrayerName,
                    time: next.time
                })
                
                await this.prayerLocationState.set({
                    prayerName: nextPrayerName,
                    prayerType: PrayerEvent.PrayerIn30m,
                    value: true
                })
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