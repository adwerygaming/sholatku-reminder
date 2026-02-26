import moment from "moment-timezone";
import DatabaseClient from "../../database/DatabaseClient.js";
import { SubscriptionSchema } from "../../types/Database.types.js";
import { DiscordMetadata, SubscriptionProvider, WhatsAppMetadata } from "../../types/Subscription.types.js";

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

export class SubscriptionRegistrar {
    private readonly db = DatabaseClient<SubscriptionSchema>("subscriptions");

    async findByProvider({ providerName }: GetByProviderProp): Promise<SubscriptionSchema[]> {
        const res = await this.db
            .select("*")
            .where("providerName", providerName)

        return res
    }

    async register({ locationId, metadata, providerName }: RegisterProp): Promise<SubscriptionSchema> {
        //! with union types, should be guarante correct metadata per provider.

        const check = await this.findByProvider({ providerName })

        const found = check.find((x) => JSON.stringify(x.metadata) === JSON.stringify(metadata))

        if (found) return found

        const [res] = await this.db
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