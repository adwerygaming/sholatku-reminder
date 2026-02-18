import { User } from "discord.js"

export interface BaseLocation {
    province: string
    city: string
}

export interface Location extends BaseLocation {
    lastUpdatedAt: string
}

export interface BaseUser {
    id: string // universinal id ({provider}-{uniqueId})
    lastUpdatedAt?: string
    provider: UserProvider
    location?: Location
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

export enum PrayerEvent {
  PrayerTime = "prayerTime",
  PrayerIn5m = "prayer_in_5m",
  PrayerIn15m = "prayer_in_15m",
  PrayerIn30m = "prayer_in_30m",
  NextPrayer = "nextPrayer",
}

// placeholder for whatsapp user, replace with user from baileys later
export interface WhatsAppUser {
    phoneNumber: string
    displayName: string
}