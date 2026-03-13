import type { Knex } from "knex";
import moment from "moment-timezone";
import type { LocationSchema, SubscriptionSchema } from "sholatku-reminder-shared/types/Database.types.js";
import type { SubscriptionFull } from "sholatku-reminder-shared/types/SholatKu.types.js";
import type { DiscordMetadata, WhatsAppMetadata } from "sholatku-reminder-shared/types/Subscription.types.js";
import { SubscriptionProvider } from "sholatku-reminder-shared/types/Subscription.types.js";
import tags from "sholatku-reminder-shared/utils/Tags.js";
import DatabaseClient from "../../database/DatabaseClient.js";
import { SubscriptionManager } from "./SubscriptionManager.js";

interface GetByProviderProp {
    providerName: SubscriptionProvider
}

interface RegisterBaseProp {
    userId: string
    locationId: string
}

type DiscordRegisterProp = RegisterBaseProp & {
    providerName: SubscriptionProvider.Discord
    metadata: DiscordMetadata
}

type WhatsAppRegisterProp = RegisterBaseProp & {
    providerName: SubscriptionProvider.WhatsApp
    metadata: WhatsAppMetadata
}

type RegisterProp = DiscordRegisterProp | WhatsAppRegisterProp

export class SubscriptionRepository {
    private db(): Knex.QueryBuilder<SubscriptionSchema, SubscriptionSchema[]> {
        return DatabaseClient<SubscriptionSchema>("subscriptions")
    }

    async findByProvider({ providerName }: GetByProviderProp): Promise<SubscriptionFull[]> {
        const res = await this.db()
            .join("locations", "subscriptions.locationId", "=", "locations.id")
            .join("user", "subscriptions.userId", "=", "user.id")
            .select<SubscriptionFull[]>([
                "subscriptions.*",
                DatabaseClient.raw(`row_to_json(locations.*) as location`),
                DatabaseClient.raw(`row_to_json("user".*) as user`)
            ])
            .where("subscriptions.providerName", providerName)

        return res
    }

    async findByDiscordGuild(guildId: DiscordMetadata["guildId"]): Promise<SubscriptionFull | null> {
        const res = await this.db()
            .join("locations", "subscriptions.locationId", "=", "locations.id")
            .join("user", "subscriptions.userId", "=", "user.id")
            .select<SubscriptionFull>([
                "subscriptions.*",
                DatabaseClient.raw(`row_to_json(locations.*) as location`),
                DatabaseClient.raw(`row_to_json("user".*) as user`)
            ])
            .where("subscriptions.providerName", SubscriptionProvider.Discord)
            .andWhereRaw("subscriptions.metadata->>'guildId' = ?", [guildId])
            .first()

        return res ?? null
    }

    /**
     * #### Fetch all locations from subscriptions and **deduped them**
     * @returns deduped LocationSchema[]
     */
    async getLocations(): Promise<LocationSchema[]> {
        const res = await this.db()
            .join("locations", "subscriptions.locationId", "=", "locations.id")
            .select<LocationSchema[]>("locations.*")
            .distinct<LocationSchema[]>("locations.id")
        
        return res
    }

    async getByLocation(locationId: string): Promise<SubscriptionSchema[]> {
        return await this.db()
            .select("*")
            .where("locationId", locationId)
    }

    async register({ locationId, metadata, providerName, userId }: RegisterProp): Promise<SubscriptionFull> {
        //! with union types, should be guarante correct metadata per provider.

        const check = await this.findByProvider({ providerName })

        const found = check.find((x) => {
            if (providerName === SubscriptionProvider.Discord) {
                const data = x.metadata as DiscordMetadata
                return data.guildId === metadata.guildId
            } else if (providerName === SubscriptionProvider.WhatsApp) {
                const data = x.metadata as WhatsAppMetadata
                return data.chatId === metadata.chatId
            }

            return false
        })

        if (found) return found

        console.log(`[${tags.PrayerService}] Registering new subscription.`)
        console.log(`[${tags.PrayerService}] Provider: ${providerName}`)
        console.log(`[${tags.PrayerService}] UserId: ${userId}`)
        console.log(metadata)

        const [inserted] = await this.db()
            .insert({
                createdAt: moment().toISOString(),
                locationId,
                userId,
                providerName,
                metadata,
            } as Knex.DbRecord<SubscriptionSchema>)
            .returning("*")

        const subManager = new SubscriptionManager(inserted.id)

        const res = await subManager.getById()
        if (!res) throw new Error(`Subscription ${inserted.id} not found after insert`)

        return res
    }
}