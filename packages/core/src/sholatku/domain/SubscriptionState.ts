import type { Knex } from "knex";
import type { SubscriptionPrayerStateSchema } from "sholatku-reminder-shared/types/Database.types.js";
import type { PrayerEvent, PrayerName } from "sholatku-reminder-shared/types/SholatKu.types.js";
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
    private db(): Knex.QueryBuilder<SubscriptionPrayerStateSchema, SubscriptionPrayerStateSchema[]> {
        return DatabaseClient<SubscriptionPrayerStateSchema>("subscriptionPrayerStates")
    }

    constructor(
        subscriptionId: string
    ) {
        this.subscriptionId = subscriptionId
    }

    async set({ prayerName, prayerType, value, date }: SetStateProp): Promise<SubscriptionPrayerStateSchema> {
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

    async get({ prayerType, prayerName, date }: GetStateProp): Promise<SubscriptionPrayerStateSchema | null> {
        const res = await this.db()
            .select("*")
            .where("subscriptionId", this.subscriptionId)
            .where("prayerName", prayerName)
            .where("prayerType", prayerType)
            .where("forDate", date)
            .first()

        return res ?? null
    }

    /**
     * Batch fetch all states for multiple subscriptions on a given date.
     * Returns a Map keyed by `subscriptionId:prayerName:prayerType` for O(1) lookup.
     */
    static async getBatch(subscriptionIds: string[], date: Date): Promise<Map<string, SubscriptionPrayerStateSchema>> {
        const rows = await DatabaseClient<SubscriptionPrayerStateSchema>("subscriptionPrayerStates")
            .select("*")
            .whereIn("subscriptionId", subscriptionIds)
            .where("forDate", date)

        const map = new Map<string, SubscriptionPrayerStateSchema>()
        for (const row of rows) {
            map.set(`${row.subscriptionId}:${row.prayerName}:${row.prayerType}`, row)
        }
        return map
    }
}