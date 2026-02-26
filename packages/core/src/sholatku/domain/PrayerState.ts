import moment from "moment-timezone"
import DatabaseClient from "../../database/DatabaseClient.js"
import { PrayerStateSchema } from "../../types/Database.types.js"

export class PrayerState {
    private readonly prayerId: string
    private readonly db = DatabaseClient<PrayerStateSchema>("prayerStates")

    constructor(
        locationId: string,
    ) {
        this.prayerId = locationId
    }

    /**
     * #### Helper function to get current day identifier
     * @returns string of DD_MM date format
     */
    private getDate(): string {
        return moment().startOf('day').toISOString()
    }

    /**
     * #### Get prayer state for today on this province and city and this eventName
     * @param eventName 
     * @returns boolean value of that state
     */
    async get(eventName: string): Promise<boolean> {
        const dateIdentifier = this.getDate()

        const res = await this.db
            .select("*")
            .where("prayerId", this.prayerId)
            .where("eventName", eventName)
            .where("forDate", dateIdentifier)
            .first()

        if (!res) {
            return false
        } else {
            return true
        }
    }

    /**
     * #### Set prayer state for today on this province and this city and this eventName
     * @param eventName 
     * @param value boolean value for that state
     */
    async set(eventName: string, value: boolean): Promise<PrayerStateSchema> {
        const [res] = await this.db
            .insert({
                lastUpdatedAt: moment().toISOString(),
                prayerId: this.prayerId,
                eventName,
                forDate: this.getDate(),
                isTriggered: value
            })
            .onConflict(["prayerId", "eventName", "forDate"])
            .merge()
            .returning("*")

        return res
    }
}