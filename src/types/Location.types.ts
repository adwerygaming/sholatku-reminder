export interface BaseLocation {
    province: string
    city: string
}

export interface Location extends BaseLocation {
    lastUpdatedAt: string
}
