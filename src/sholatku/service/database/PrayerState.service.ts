import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"
import SholatKuService from "../SholatKu.service.js"

export default function PrayerState(province: string, city: string) {
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