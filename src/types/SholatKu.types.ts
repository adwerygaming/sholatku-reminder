export interface BaseLocation {
    province: string
    city: string
}

export interface Location extends BaseLocation {
    lastUpdatedAt: string
}

/**
 * Detailed user information 
 */
export interface BaseUser {
    id: string // universinal id ({provider}-{uniqueId})
    lastUpdatedAt?: string
    provider: SholatkuUserProvider
    location?: Location
}

export type SholatkuUser = SholatkuDiscordUser | SholatkuWhatsAppUser

export interface SholatkuDiscordUser extends BaseUser {
    provider: SholatkuUserProvider.Discord
    discordId: string
    displayName: string
    username: string
}

export interface SholatkuWhatsAppUser extends BaseUser {
    provider: SholatkuUserProvider.WhatsApp
    phoneNumber: string
    displayName: string
}

export enum SholatkuUserProvider {
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