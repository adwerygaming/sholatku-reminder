import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"
import SholatKuService from "../SholatKu.service.js"

export default function PrayerState(province: string, city: string) {
    province = SholatKuService.Helper.normalizeInput(province)
    city = SholatKuService.Helper.normalizeInput(city)

    const now = moment()
    const dayIdentifier = now.format("DD_MM") // 11_03
    const db = DatabaseClient.table("prayer_state")

    const chain = {
        /**
         * Retrieves whether a given prayer event for today has been marked.
         *
         * @async
         * @param {string} eventName - The prayer event identifier (e.g. subuh, zuhur)
         * @returns {Promise<boolean>} True when the event is marked in the cache, otherwise false
         */
        async get(eventName: string): Promise<boolean> {
            const res = await db.get(`${province}.${city}.${dayIdentifier}.${eventName}`)

            return res ? true : false
        },
        
        /**
         * Stores the prayer event state for today in the cache.
         *
         * @async
         * @param {string} eventName - The prayer event identifier
         * @param {boolean} value - State to set (true when processed/acknowledged)
         * @returns {Promise<void>} Resolves when the state has been stored
         */
        async set(eventName: string, value: boolean): Promise<void> {
            await db.set(`${province}.${city}.${dayIdentifier}.${eventName}`, value)
        }
    }

    return chain
}