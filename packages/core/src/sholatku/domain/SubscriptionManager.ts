import DatabaseClient from "../../database/DatabaseClient.js"
import { SubscriptionSchema } from "../../types/Database.types.js"

export class SubscriptionManager {
    private readonly db = DatabaseClient<SubscriptionSchema>("subscriptions")
}