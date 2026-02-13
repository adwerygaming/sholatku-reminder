import DatabaseClient from "../../../database/DatabaseClient.js"
import { Imsakiyah } from "../../../types/PrayerTimeData.js"
import tags from "../../../utils/Tags.js"
import SholatKuService from "../SholatKu.js"

export default function PrayerData(province: string, city: string) {
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