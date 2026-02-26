import { Knex } from "knex";
import moment from "moment-timezone";
import DatabaseClient from "../../database/DatabaseClient.js";
import { PrayerLocationStateSchema } from "../../types/Database.types.js";
import { PrayerEvent, PrayerName } from "../../types/Prayer.types.js";

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
    private readonly prayerId: string
    private db(): Knex.QueryBuilder<PrayerLocationStateSchema, PrayerLocationStateSchema[]> {
        return DatabaseClient<PrayerLocationStateSchema>("prayerLocationStates")
    }

    constructor(
        locationId: string,
    ) {
        this.prayerId = locationId
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

        const res = await this.db()
            .select("*")
            .where("prayerId", this.prayerId)
            .where("prayerName", prayerName)
            .where("prayerType", prayerType)
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
    async set({ prayerName, prayerType, value }: SetPrayerData): Promise<PrayerLocationStateSchema> {
        const [res] = await this.db()
            .insert({
                lastUpdatedAt: moment().toISOString(),
                prayerId: this.prayerId,
                prayerName,
                prayerType,
                forDate: this.getDate(),
                isTriggered: value
            })
            .onConflict(["prayerId", "prayerName", "prayerType", "forDate"])
            .merge()
            .returning("*")

        return res
    }
}