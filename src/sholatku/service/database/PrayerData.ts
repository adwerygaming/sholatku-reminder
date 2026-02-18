import DatabaseClient from "../../../database/DatabaseClient.js"
import { PrayerTimeData } from "../../../types/Prayer.types.js"
import tags from "../../../utils/Tags.js"
import Helper from "../helper/Helper.js"
import SholatKuService from "../SholatKu.service.js"

export class PrayerData {
    private readonly province
    private readonly city

    constructor(
        province: string,
        city: string,
        private readonly db = DatabaseClient.table("prayer_data")
    ) {
        this.province = Helper.normalizeInput(province)
        this.city = Helper.normalizeInput(city)
    }

    async get(): Promise<PrayerTimeData[] | null> {
        console.log(`[${tags.System}] Fetching prayer data FROM CACHE for ${this.city}, ${this.province}`)
        const res: PrayerTimeData[] | null = await this.db.get(`${this.province}.${this.city}`)

        //! if get no data, try passing non normalize input for both province and city.
        if (!res) {
            const data = await SholatKuService.Prayer.fetchPrayerData({ province: this.province, city: this.city })

            if (data.length === 0 || !data || typeof data === "undefined") {
                return null
            }

            await this.set(data)
            return data
        }

        return res
    }

    async set(data: PrayerTimeData[]): Promise<void> {
        await this.db.set(`${this.province}.${this.city}`, data)
    }
}