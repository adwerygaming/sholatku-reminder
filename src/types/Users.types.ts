import { User } from "discord.js"
import { WhatsAppUser } from "./SholatKu.types.js"

export interface BaseUser {
    id: string // universinal uuid
    lastUpdatedAt?: string
    provider: UserProvider
    location?: Location
}

export type SholatkuUnionUser = {
    provider: UserProvider.Discord,
    user: User
} | {
    provider: UserProvider.WhatsApp,
    user: WhatsAppUser
}

export type SholatkuUser = DiscordUserAccount | WhatsAppUserAccount

export interface DiscordUserAccount extends BaseUser {
    provider: UserProvider.Discord
    discordId: User["id"]
    displayName: User["displayName"]
    username: User["username"]
}

export interface WhatsAppUserAccount extends BaseUser {
    provider: UserProvider.WhatsApp
    phoneNumber: WhatsAppUser["phoneNumber"]
    displayName: WhatsAppUser["displayName"]
}

export enum UserProvider {
    Discord = "discord",
    WhatsApp = "whatsapp"
}