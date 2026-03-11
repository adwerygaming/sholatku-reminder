import { Knex } from "knex";
import { SubscriptionSchema } from "sholatku-reminder-shared/types/Database.types.js";
import { SubscriptionFull } from "sholatku-reminder-shared/types/SholatKu.types.js";
import DatabaseClient from "../../database/DatabaseClient.js";

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
    }

    async unsubscribe(): Promise<SubscriptionSchema | null> {
        const res = await this.db()
            .where("id", this.subscriptionId)
            .delete()
            .returning("*")
            .first()

        if (!res) {
            return null
        }

        return res
    }
}