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
    prayerTimes: string; // JSON stringified data
}

export interface PrayerStateSchema extends BaseDatabaseSchema {
    prayerId: string;
    eventName: string;
    forDate: string;
    isTriggered: boolean;
}

export interface SubscriptionSchema extends BaseDatabaseSchema {
    providerName: string;
    metadata: string; // JSON stringified data
}

export interface DatabaseTables {
    locations: LocationSchema;
    prayer_data: PrayerDataSchema;
    prayer_states: PrayerStateSchema;
    subscriptions: SubscriptionSchema;
}