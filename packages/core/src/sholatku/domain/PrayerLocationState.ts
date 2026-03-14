import type { Knex } from "knex";
import moment from "moment-timezone";
import type { LocationPrayerStateSchema } from "sholatku-reminder-shared/types/Database.types.js";
import type { PrayerEvent, PrayerName } from "sholatku-reminder-shared/types/SholatKu.types.js";
import tags from "sholatku-reminder-shared/utils/Tags.js";
import DatabaseClient from "../../database/DatabaseClient.js";

interface GetPrayerState {
    prayerName: PrayerName;
    prayerType: PrayerEvent;
}

interface SetPrayerData {
    prayerName: PrayerName;
    prayerType: PrayerEvent;
    value: boolean;
}

export class PrayerLocationState {
    private readonly locationId: string
    private db(): Knex.QueryBuilder<LocationPrayerStateSchema, LocationPrayerStateSchema[]> {
        return DatabaseClient<LocationPrayerStateSchema>("locationPrayerStates")
    }

    constructor(
        locationId: string,
    ) {
        this.locationId = locationId
    }

    /**
     * #### Helper function to get current day identifier
     * @returns string of DD_MM date format
     */
    private getDate(): Date {
        return moment().startOf('day').toDate()
    }

    /**
     * #### Get prayer state for today on this province and city and this eventName
     * @param eventName 
     * @returns boolean value of that state
     */
    async get({ prayerName, prayerType }: GetPrayerState): Promise<boolean> {
        const dateIdentifier = this.getDate()
        try {
            const res = await this.db()
                .select("*")
                .where("locationId", this.locationId)
                .where("prayerName", prayerName)
                .where("prayerType", prayerType)
                .where("forDate", dateIdentifier)
                .first()

            if (!res) {
                return false
            } else {
                return true
            }
        } catch (e) {
            console.log(`[${tags.Error}] Failed to get prayer state for location ${this.locationId}.`)
            console.error(e)
            throw e
        }
    }

    /**
     * #### Set prayer state for today on this province and this city and this eventName
     * @param eventName 
     * @param value boolean value for that state
     */
    async set({ prayerName, prayerType, value }: SetPrayerData): Promise<LocationPrayerStateSchema> {
        try {
            const [res] = await this.db()
                .insert({
                    lastUpdatedAt: moment().toISOString(),
                    locationId: this.locationId,
                    prayerName,
                    prayerType,
                    forDate: this.getDate(),
                    isTriggered: value
                })
                .onConflict(["locationId", "prayerName", "prayerType", "forDate"])
                .merge(["lastUpdatedAt", "isTriggered"])
                .returning("*")

            return res
        } catch (e) {
            console.log(`[${tags.Error}] Failed to set prayer state for location ${this.locationId}.`)
            console.error(e)
            throw e
        }
    }
}