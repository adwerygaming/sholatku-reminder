import moment from "moment-timezone"
import DatabaseClient from "../../database/DatabaseClient.js"
import { SholatkuUser } from "../../types/Users.types.js"
import SholatKuServiceHelper from "../helper/Helper.js"

// has user
export class UserAccount {
    constructor(
        private readonly user: SholatkuUser,
        private readonly db = DatabaseClient.table("users"),
        private readonly prayerStateDb = DatabaseClient.table("user_prayer_state")
    ) { }

    /**
     * #### Get this user's prayer state of this eventName
     * @param eventName 
     * @returns boolean value of that user's prayer state
     */
    async getPrayerState(eventName: string): Promise<boolean> {
        const now = moment()
        const dayIdentifier = now.format("DD_MM")

        const res = await this.prayerStateDb.get(`${this.user.id}.${dayIdentifier}.${eventName}`)

        return res ? true : false
    }

    /**
     * #### Sets this user's prayer state of this eventName
     * @param eventName 
     * @param value boolean value for that user's prayer state
     */
    async setPrayerState(eventName: string, value: boolean): Promise<void> {
        const now = moment()
        const dayIdentifier = now.format("DD_MM")
        await this.prayerStateDb.set(`${this.user.id}.${dayIdentifier}.${eventName}`, value)
    }

    // =======

    /**
     * #### Get this user's province from database
     * @returns Province value of that user. Could be string or null.
     */
    async getProvince(): Promise<string | null> {
        const res = await this.db.get<string>(`${this.user.id}.location.province`)
        return res || null
    }

    /**
     * #### Set this user's province to database
     * @param province Province value for that user
     */
    async setProvince(province: string): Promise<void> {
        province = SholatKuServiceHelper.normalizeInput(province)

        await this.db.set(`${this.user.id}.location.province`, province)
        await this.db.set(`${this.user.id}.location.lastUpdatedAt`, moment().toISOString())
    }

    /**
     * #### Get this user's city from database
     * @returns City value of hat user. Could be string or null.
     */
    async getCity(): Promise<string | null> {
        const res = await this.db.get<string>(`${this.user.id}.location.city`)
        return res || null
    }

    /**
     * #### Set this user's city to database
     * @param city City value for that user
     */
    async setCity(city: string): Promise<void> {
        city = SholatKuServiceHelper.normalizeInput(city)

        await this.db.set(`${this.user.id}.location.city`, city)
        await this.db.set(`${this.user.id}.location.lastUpdatedAt`, moment().toISOString())
    }

    /**
     * #### Unregister this user by deleting location data from database. 
     * ----
     * This will make the user not receive any prayer event notification, 
     * because the service doesn't know where this user is located.
     */
    async unregister(): Promise<void> {
        await this.db.delete(`${this.user.id}.location`)
    }

    /**
     * #### Fetch this full user data (SholatkuUser) from database.
     * @returns SholatkuUser object. Could be null if user not exist in database.
     */
    async fetch(): Promise<SholatkuUser | null> {
        const user = await this.db.get<SholatkuUser>(`${this.user.id}`)
        return user
    }

    /**
     * #### Check if this user is registered or not
     * ---
     * By checking the existence of location data in database.
     * @returns boolean value of that user is registered or nah.
     */
    async isRegistered(): Promise<boolean> {
        const user = await this.db.get<SholatkuUser>(`${this.user.id}`)
        return user?.location ? true : false
    }
}
