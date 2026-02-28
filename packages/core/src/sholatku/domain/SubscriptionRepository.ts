import { Knex } from "knex";
import moment from "moment-timezone";
import tags from "sholatku-reminder-shared/utils/Tags.js";
import DatabaseClient from "../../database/DatabaseClient.js";
import { SubscriptionSchema } from "sholatku-reminder-shared/types/Database.types.js";
import { DiscordMetadata, SubscriptionProvider, WhatsAppMetadata } from "sholatku-reminder-shared/types/Subscription.types.js";

interface GetByProviderProp {
    providerName: SubscriptionProvider
}

interface RegisterBaseProp {
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

    async findByProvider({ providerName }: GetByProviderProp): Promise<SubscriptionSchema[]> {
        const res = await this.db()
            .select("*")
            .where("providerName", providerName)

        return res
    }
    
    async findByDiscordGuild(guildId: DiscordMetadata["guildId"]): Promise<SubscriptionSchema | null> {
        const res = await this.db()
            .select("*")
            .where("providerName", SubscriptionProvider.Discord)
            .andWhereRaw("metadata->>'guildId' = ?", [guildId])
            .first()

        return res ?? null
    }

    async getByLocation(locationId: string): Promise<SubscriptionSchema[]> {
        return this.db()
            .select("*")
            .where("locationId", locationId)
    }

    async register({ locationId, metadata, providerName }: RegisterProp): Promise<SubscriptionSchema> {
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
        console.log(metadata)

        const [res] = await this.db()
            .insert({
                createdAt: moment().toISOString(),
                locationId,
                providerName,
                metadata
            } as SubscriptionSchema)
            .returning("*")
        
        return res
    }
}