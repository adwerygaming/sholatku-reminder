import { PrayerEvent, PrayerName, PrayerTimeData } from "./SholatKu.types.js";
import { DiscordMetadata, SubscriptionProvider, WhatsAppMetadata } from "./Subscription.types.js";

// Sholatku

/**
 * Base Universal Sholatku Database Schema
 */
export interface BaseDatabaseSchema {
    id: string;
    createdAt: string;
    lastUpdatedAt: string;
}

/**
 * Location Data, Containing province & city.
 */
export interface LocationSchema extends BaseDatabaseSchema {
    province: string;
    city: string;
}

/**
 * Stores LocationId and Array of PrayerTimeData (Prayer times in a single day)
 */
export interface PrayerDataSchema extends BaseDatabaseSchema {
    locationId: string;
    prayerTimes: PrayerTimeData[];
}

/**
 * Tracks whether a prayer event has been triggered for a specific location on a given date.
 */
export interface LocationPrayerStateSchema extends BaseDatabaseSchema {
    locationId: string;
    prayerName: PrayerName;
    prayerType: PrayerEvent;
    forDate: Date;
    isTriggered: boolean;
}

/**
 * Tracks whether a prayer event has been triggered for a specific subscription on a given date.
 */
export interface SubscriptionPrayerStateSchema extends BaseDatabaseSchema {
    subscriptionId: string;
    prayerName: PrayerName;
    prayerType: PrayerEvent;
    forDate: Date;
    isTriggered: boolean;
}

/**
 * Base schema for all subscription types, linking a user to a location.
 */
export interface BaseSubscriptionSchema extends BaseDatabaseSchema {
    locationId: string
    userId: string
}

/** A subscription delivered via Discord. */
export type DiscordSubscription = BaseSubscriptionSchema & {
    providerName: SubscriptionProvider.Discord
    metadata: DiscordMetadata
}

/** A subscription delivered via WhatsApp. */
export type WhatsAppSubscription = BaseSubscriptionSchema & {
    providerName: SubscriptionProvider.WhatsApp
    metadata: WhatsAppMetadata
}

/** Union of all supported subscription provider schemas. */
export type SubscriptionSchema = DiscordSubscription | WhatsAppSubscription

// Better Auth

/**
 * Represents an authenticated user.
 */
export interface UserSchema {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Represents an active user session.
 */
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

/**
 * Represents a linked OAuth or credential account for a user.
 */
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

/**
 * Stores verification tokens (e.g. email verification, password reset).
 */
export interface VerificationSchema {
    id: string;
    identifier: string;
    value: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Maps table names to their corresponding schema types.
 * Used as the generic parameter for the database client.
 */
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