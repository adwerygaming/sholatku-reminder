import type { Knex } from "knex";
import moment from "moment-timezone";
import DatabaseClient from "sholatku-reminder-core/src/database/DatabaseClient.js";
import { SubscriptionManager } from "sholatku-reminder-core/src/sholatku/domain/SubscriptionManager.js";
import type { LocationSchema, SubscriptionSchema } from "sholatku-reminder-shared/types/Database.types.js";
import type { SubscriptionFull } from "sholatku-reminder-shared/types/SholatKu.types.js";
import type { DiscordMetadata, WhatsAppMetadata } from "sholatku-reminder-shared/types/Subscription.types.js";
import { SubscriptionProvider } from "sholatku-reminder-shared/types/Subscription.types.js";
import tags from "sholatku-reminder-shared/utils/Tags.js";

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
        try {
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
        } catch (e) {
            console.log(`[${tags.Error}] Failed to find subscriptions by provider ${providerName}.`)
            console.error(e)
            throw e
        }
    }

    async findByDiscordGuild(guildId: DiscordMetadata["guildId"]): Promise<SubscriptionFull | null> {
        try {
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
        } catch (e) {
            console.log(`[${tags.Error}] Failed to find subscription by guild ${guildId}.`)
            console.error(e)
            throw e
        }
    }

    /**
     * #### Fetch all locations from subscriptions and **deduped them**
     * @returns deduped LocationSchema[]
     */
    async getLocations(): Promise<LocationSchema[]> {
        try {
            const res = await this.db()
                .join("locations", "subscriptions.locationId", "=", "locations.id")
                .select<LocationSchema[]>("locations.*")
                .distinct<LocationSchema[]>("locations.id")
            
            return res
        } catch (e) {
            console.log(`[${tags.Error}] Failed to fetch locations from subscriptions.`)
            console.error(e)
            throw e
        }
    }

    async getByLocation(locationId: string): Promise<SubscriptionSchema[]> {
        try {
            return await this.db()
                .select("*")
                .where("locationId", locationId)
        } catch (e) {
            console.log(`[${tags.Error}] Failed to fetch subscriptions by location ${locationId}.`)
            console.error(e)
            throw e
        }
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

        try {
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
        } catch (e) {
            console.log(`[${tags.Error}] Failed to register subscription.`)
            console.error(e)
            throw new Error(`Failed to register subscription`)
        }
    }
}