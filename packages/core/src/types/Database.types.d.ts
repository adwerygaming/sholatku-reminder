export interface BaseDatabaseSchema {
    id: string;
    createdAt: string;
    lastUpdatedAt: string;
}

export interface Locations extends BaseDatabaseSchema {
    province: string;
    city: string;
}

export interface PrayerData extends BaseDatabaseSchema {
    locationId: string;
    prayerTimes: string; // JSON stringified data
}

export interface PrayerStates extends BaseDatabaseSchema {
    prayerId: string;
    eventName: string;
    forDate: string;
}

export interface Subscriptions extends BaseDatabaseSchema {
    providerName: string;
    metadata: string; // JSON stringified data
}

export interface DatabaseTables {
    locations: Locations;
    prayer_data: PrayerData;
    prayer_states: PrayerStates;
    subscriptions: Subscriptions;
}