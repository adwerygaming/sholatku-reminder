import type { Knex } from "knex";
import DatabaseClient from "sholatku-reminder-core/src/database/DatabaseClient.js";
import type { SubscriptionSchema } from "sholatku-reminder-shared/types/Database.types.js";
import type { SubscriptionFull } from "sholatku-reminder-shared/types/SholatKu.types.js";
import tags from "sholatku-reminder-shared/utils/Tags.js";

export class SubscriptionManager {
    private db(): Knex.QueryBuilder<SubscriptionSchema, SubscriptionSchema[]> {
        return DatabaseClient<SubscriptionSchema>("subscriptions")
    }
    private readonly subscriptionId: string

    constructor(
        subscriptionId: string
    ) {
        this.subscriptionId = subscriptionId
    }

    async getById(): Promise<SubscriptionFull | null> {
        try {
            const res = await this.db()
                .join("locations", "subscriptions.locationId", "=", "locations.id")
                .join("user", "subscriptions.userId", "=", "user.id")
                .select<SubscriptionFull>([
                    "subscriptions.*",
                    DatabaseClient.raw(`row_to_json(locations.*) as location`),
                    DatabaseClient.raw(`row_to_json("user".*) as user`)
                ])
                .where("subscriptions.id", this.subscriptionId)
                .first()

            if (!res) {
                return null
            }

            return res
        } catch (e) {
            console.log(`[${tags.Error}] Failed to get subscription ${this.subscriptionId}.`)
            console.error(e)
            throw e
        }
    }

    async unsubscribe(): Promise<SubscriptionSchema | null> {
        try {
            const res = await this.db()
                .where("id", this.subscriptionId)
                .delete()
                .returning("*")
                .first()

            if (!res) {
                return null
            }

            return res
        } catch (e) {
            console.log(`[${tags.Error}] Failed to unsubscribe ${this.subscriptionId}.`)
            console.error(e)
            throw e
        }
    }
}