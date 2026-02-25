import { User } from "discord.js"
import { Location } from "./Location.types.js"
import { WhatsAppUser } from "./SholatKu.types.js"

export interface BaseSubscription {
    id: string // universinal uuid
    lastUpdatedAt?: string
    provider: SubscriptionProvider
    location?: Location
}

export type SholatkuUnionSubsription = {
    provider: SubscriptionProvider.Discord,
    subscription: User
} | {
    provider: SubscriptionProvider.WhatsApp,
    subscription: WhatsAppUser
}

export type SholatkuSubscription = DiscordSubscription | WhatsAppSubscription

export interface DiscordSubscription extends BaseSubscription {
    provider: SubscriptionProvider.Discord
    guildId: string
    channelId: string
}

export interface WhatsAppSubscription extends BaseSubscription {
    provider: SubscriptionProvider.WhatsApp
    chatId: string
}

export enum SubscriptionProvider {
    Discord = "discord",
    WhatsApp = "whatsapp"
}