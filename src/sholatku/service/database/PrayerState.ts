import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"
import Helper from "../helper/Helper.js"

export class PrayerState {
    private readonly province: string
    private readonly city: string

    constructor(
        province: string,
        city: string,
        private readonly db = DatabaseClient.table("prayer_state")
    ) {
        this.province = Helper.normalizeInput(province)
        this.city = Helper.normalizeInput(city)
    }

    private getDayIdentifier(): string {
        const now = moment()
        return now.format("DD_MM") // 11_03
    }

    async get(eventName: string): Promise<boolean> {
        const dayIdentifier = this.getDayIdentifier()

        const res = await this.db.get(`${this.province}.${this.city}.${dayIdentifier}.${eventName}`)

        return res ? true : false
    }

    async set(eventName: string, value: boolean): Promise<void> {
        const dayIdentifier = this.getDayIdentifier()

        await this.db.set(`${this.province}.${this.city}.${dayIdentifier}.${eventName}`, value)
    }
}