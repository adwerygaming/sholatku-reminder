export interface DiscordMetadata {
    guildId: string,
    channelId: string
}

export interface WhatsAppMetadata {
    chatId: string
}

export enum SubscriptionProvider {
    Discord = "discord",
    WhatsApp = "whatsapp"
}