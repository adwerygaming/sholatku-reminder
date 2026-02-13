import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"

export default function SholatKuServiceUserPrayerState(userId: string) {
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