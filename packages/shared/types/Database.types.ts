import { PrayerEvent, PrayerName, PrayerTimeData } from "./SholatKu.types.js";
import { DiscordMetadata, SubscriptionProvider, WhatsAppMetadata } from "./Subscription.types.js";

// Sholatku
export interface BaseDatabaseSchema {
    id: string;
    createdAt: string;
    lastUpdatedAt: string;
}

export interface LocationSchema extends BaseDatabaseSchema {
    province: string;
    city: string;
}

export interface PrayerDataSchema extends BaseDatabaseSchema {
    locationId: string;
    prayerTimes: PrayerTimeData[];
}

export interface LocationPrayerStateSchema extends BaseDatabaseSchema {
    locationId: string;
    prayerName: PrayerName;
    prayerType: PrayerEvent;
    forDate: Date;
    isTriggered: boolean;
}

export interface SubscriptionPrayerStateSchema extends BaseDatabaseSchema {
    subscriptionId: string;
    prayerName: PrayerName;
    prayerType: PrayerEvent;
    forDate: Date;
    isTriggered: boolean;
}

export interface BaseSubscriptionSchema extends BaseDatabaseSchema {
    locationId: string
    userId: string
}

export type DiscordSubscription = BaseSubscriptionSchema & {
    providerName: SubscriptionProvider.Discord
    metadata: DiscordMetadata
}

export type WhatsAppSubscription = BaseSubscriptionSchema & {
    providerName: SubscriptionProvider.WhatsApp
    metadata: WhatsAppMetadata
}

export type SubscriptionSchema = DiscordSubscription | WhatsAppSubscription

// Better Auth
export interface UserSchema {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SessionSchema {
    id: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
}

export interface AccountSchema {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    accessTokenExpiresAt: string | null;
    refreshTokenExpiresAt: string | null;
    scope: string | null;
    password: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface VerificationSchema {
    id: string;
    identifier: string;
    value: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface DatabaseTables {
    prayerData: PrayerDataSchema;
    locations: LocationSchema;
    locationPrayerStates: LocationPrayerStateSchema;
    subscriptions: SubscriptionSchema;
    subscriptionPrayerStates: SubscriptionPrayerStateSchema;
    user: UserSchema;
    session: SessionSchema;
    account: AccountSchema;
    verification: VerificationSchema;
}