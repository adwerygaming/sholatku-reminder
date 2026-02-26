import { PrayerEvent, PrayerName } from "./Prayer.types.ts";

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

export interface SubscriptionSchema extends BaseDatabaseSchema {
    providerName: string;
    metadata: string;
}

export interface DatabaseTables {
    locations: LocationSchema;
    prayer_data: PrayerDataSchema;
    prayer_location_states: PrayerLocationStateSchema;
    prayer_subscription_states: PrayerSubscriptionStateSchema;
    subscriptions: SubscriptionSchema;
}