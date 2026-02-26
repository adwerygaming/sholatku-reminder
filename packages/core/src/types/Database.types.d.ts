import { PrayerEvent, PrayerName } from "./Prayer.types.ts";
import { DiscordMetadata, SubscriptionProvider, WhatsAppMetadata } from "./Subscription.types.ts";

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
    prayerTimes: string;
}

export interface PrayerLocationStateSchema extends BaseDatabaseSchema {
    prayerId: string;
    prayerName: PrayerName;
    prayerType: PrayerEvent;
    forDate: Date;
    isTriggered: boolean;
}

export interface PrayerSubscriptionStateSchema extends BaseDatabaseSchema {
    subscriptionId: string;
    prayerName: PrayerName;
    prayerType: PrayerEvent;
    forDate: Date;
    isTriggered: boolean;
}

export interface BaseSubscriptionSchema extends BaseDatabaseSchema {
    locationId: string
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

export interface DatabaseTables {
    locations: LocationSchema;
    prayerData: PrayerDataSchema;
    prayerLocationStates: PrayerLocationStateSchema;
    subscriptions: SubscriptionSchema;
    prayerSubscriptionStates: PrayerSubscriptionStateSchema;
}