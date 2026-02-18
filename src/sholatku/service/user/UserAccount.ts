import { User } from "discord.js"
import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"
import { SholatkuUser, UserProvider, WhatsAppUser } from "../../../types/SholatKu.types.js"
import SholatKuServiceHelper from "../helper/Helper.js"



// has user
export class UserAccount {
    constructor(
        private readonly user: SholatkuUser,
        private readonly db = DatabaseClient.table("users"),
        private readonly prayerStateDb = DatabaseClient.table("user_prayer_state")
    ) { }

    async getPrayerState(eventName: string): Promise<boolean> {
        const now = moment()
        const dayIdentifier = now.format("DD_MM")

        const res = await this.prayerStateDb.get(`${this.user.id}.${dayIdentifier}.${eventName}`)

        return res ? true : false
    }

    async setPrayerState(eventName: string, value: boolean): Promise<void> {
        const now = moment()
        const dayIdentifier = now.format("DD_MM")
        await this.prayerStateDb.set(`${this.user.id}.${dayIdentifier}.${eventName}`, value)
    }

    // =======

    async getProvince(): Promise<string | null> {
        const res = await this.db.get<string>(`${this.user.id}.location.province`)
        return res || null
    }

    async setProvince(province: string): Promise<void> {
        province = SholatKuServiceHelper.normalizeInput(province)

        await this.db.set(`${this.user.id}.location.province`, province)
        await this.db.set(`${this.user.id}.location.lastUpdatedAt`, moment().toISOString())
    }

    async getCity(): Promise<string | null> {
        const res = await this.db.get<string>(`${this.user.id}.location.city`)
        return res || null
    }

    async setCity(city: string): Promise<void> {
        city = SholatKuServiceHelper.normalizeInput(city)

        await this.db.set(`${this.user.id}.location.city`, city)
        await this.db.set(`${this.user.id}.location.lastUpdatedAt`, moment().toISOString())
    }

    async unregister(): Promise<void> {
        await this.db.delete(`${this.user.id}.location`)
    }

    async fetch(): Promise<SholatkuUser | null> {
        const user = await this.db.get<SholatkuUser>(`${this.user.id}`)
        return user
    }

    async isRegistered(): Promise<boolean> {
        const user = await this.db.get<SholatkuUser>(`${this.user.id}`)
        return user?.location ? true : false
    }
}
