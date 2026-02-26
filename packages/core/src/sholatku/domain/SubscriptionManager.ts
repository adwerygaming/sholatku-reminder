import DatabaseClient from "../../database/DatabaseClient.js";
import { SubscriptionSchema } from "../../types/Database.types.js";

export class SubscriptionManager {
    private readonly db = DatabaseClient<SubscriptionSchema>("subscriptions");
    private readonly subscriptionId: string

    constructor(
        subscriptionId: string
    ) {
        this.subscriptionId = subscriptionId
    }

    async getById(): Promise<SubscriptionSchema | null> {
        const res = await this.db
            .select("*")
            .where("id", this.subscriptionId)
            .first()

        if (!res) {
            return null
        }

        return res
    }

    async getByLocation(locationId: string): Promise<SubscriptionSchema[]> {
        const res = await this.db
            .select("*")
            .where("id", this.subscriptionId)
            .where("locationId", locationId)

        return res
    }

    async unsubscribe(): Promise<SubscriptionSchema | null> {
        const res = await this.db
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