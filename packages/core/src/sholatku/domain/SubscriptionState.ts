import { Knex } from "knex";
import { PrayerSubscriptionStateSchema } from "sholatku-reminder-shared/types/Database.types.js";
import { PrayerEvent, PrayerName } from "sholatku-reminder-shared/types/SholatKu.types.js";
import DatabaseClient from "../../database/DatabaseClient.js";

interface SetStateProp {
    prayerName: PrayerName
    prayerType: PrayerEvent
    date: Date
    value: boolean
}

interface GetStateProp {
    prayerName: PrayerName
    prayerType: PrayerEvent
    date: Date
}

export class SubscriptionState {
    private readonly subscriptionId: string

    private db(): Knex.QueryBuilder<PrayerSubscriptionStateSchema, PrayerSubscriptionStateSchema[]> {
        return DatabaseClient<PrayerSubscriptionStateSchema>("prayerSubscriptionStates")
    }

    constructor(
        subscriptionId: string
    ) {
        this.subscriptionId = subscriptionId
    }

    async set({ prayerName, prayerType, value, date }: SetStateProp): Promise<PrayerSubscriptionStateSchema> {
        const [res] = await this.db()
            .insert({
                subscriptionId: this.subscriptionId,
                prayerName,
                prayerType,
                forDate: date,
                isTriggered: value
            })
            .onConflict(["subscriptionId", "prayerName", "prayerType", "forDate"])
            .merge(["isTriggered"])
            .returning("*")

        return res
    }

    async get({ prayerType, prayerName, date }: GetStateProp): Promise<PrayerSubscriptionStateSchema | null> {
        const res = await this.db()
            .select("*")
            .where("subscriptionId", this.subscriptionId)
            .where("prayerName", prayerName)
            .where("prayerType", prayerType)
            .where("forDate", date)
            .first()

        if (!res) {
            return null
        }

        return res
    }
}