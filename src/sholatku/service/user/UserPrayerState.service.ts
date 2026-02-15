import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"
import { PrayerEvent, SholatkuUser } from "../../../types/SholatKu.types.js"

export default function SholatKuServiceUserPrayerState(user: SholatkuUser) {
    const now = moment()
    const dayIdentifier = now.format("DD_MM") // 11_03
    const db = DatabaseClient.table("user_prayer_state")

    const userId = user.id

    const chain = {
        /**
         * Get the prayer state of the user.
         * @param eventName PrayerEvent
         * @returns 
         */
        async get(eventName: PrayerEvent): Promise<boolean> {
            const res = await db.get(`${userId}.${dayIdentifier}.${eventName}`)

            return res ? true : false
        },

        /**
         * Sets the prayer state of the user.
         * @param eventName PrayerEvent
         * @param value boolean. 
         * @returns 
         */
        async set(eventName: PrayerEvent, value: boolean): Promise<void> {
            await db.set(`${userId}.${dayIdentifier}.${eventName}`, value)
        }
    }

    return chain
}