import FuzzySearch from 'fuzzy-search';
import type { Knex } from 'knex';
import DatabaseClient from 'sholatku-reminder-core/src/database/DatabaseClient.js';
import { normalizeInput, slugify } from 'sholatku-reminder-core/src/sholatku/helper/Helper';
import type { LocationSchema, SubscriptionSchema } from 'sholatku-reminder-shared/types/Database.types.js';
import type { LocationSearchResult } from 'sholatku-reminder-shared/types/Location.types.js';
import tags from 'sholatku-reminder-shared/utils/Tags.js';

interface LocationFetchResult {
    [province: string]: string[]
}

interface GetByLocationProp {
    province: string
    city: string
}

export class Location {
    // private readonly db = DatabaseClient<LocationSchema>("locations")
    private db(): Knex.QueryBuilder<LocationSchema, LocationSchema[]> {
        return DatabaseClient<LocationSchema>("locations")
    }

    async getSubscribedLocations(): Promise<LocationSchema[]> {
        try {
            const locationIds = await DatabaseClient<SubscriptionSchema>("subscriptions").distinct("locationId")
            const mappedLocIds = locationIds.map(x => x.locationId)

            const res = await this.db()
                .whereIn("id", mappedLocIds)

            return res
        } catch (e) {
            console.log(`[${tags.Error}] Failed to fetch subscribed locations.`)
            console.error(e)
            throw e
        }
    }

    async getById(locationId: string): Promise<LocationSchema | null> {
        try {
            const res = await this.db()
                .select("*")
                .where("id", locationId)
                .first()

            if (!res) {
                return null
            }

            return res
        } catch (e) {
            console.log(`[${tags.Error}] Failed to get location by id ${locationId}.`)
            console.error(e)
            throw e
        }
    }

    async getByLocation({ province, city }: GetByLocationProp): Promise<LocationSchema | null> {
        try {
            const res = await this.db()
                .select("*")
                .where("province", province)
                .where("city", city)
                .first()

            if (!res) {
                return null
            }

            return res
        } catch (e) {
            console.log(`[${tags.Error}] Failed to get location for ${province}, ${city}.`)
            console.error(e)
            throw e
        }
    }

    /**
     * #### Fetches all location data, structured with the province as the key
     * ---
     * and an array of city strings as the value.
     * @returns An array of objects mapping province keys to their city arrays.
     */
    async fetch(): Promise<LocationFetchResult[]> {
        try {
            const data = await this.db().select('province', 'city')

            const sortedData = data.reduce((acc: LocationFetchResult[], curr) => {
                const provinceKey = normalizeInput(curr.province)
                const cityValue = normalizeInput(curr.city)

                const existingProvince = acc.find(x => Object.keys(x)[0] === provinceKey)

                if (existingProvince) {
                    existingProvince[provinceKey].push(cityValue)
                } else {
                    acc.push({ [provinceKey]: [cityValue] })
                }

                return acc
            }, [])

            return sortedData
        } catch (e) {
            console.log(`[${tags.Error}] Failed to fetch locations data.`)
            console.error(e)
            throw e
        }
    }

    /**
     * #### Retrieves all available provinces as a deduplicated array of strings.
     * @returns A promise resolving to an array of province identifiers.
     */
    async getProvinces(): Promise<string[]> {
        try {
            const provinces = await this.db().distinct('province')
            const sortedProvinces = provinces.map(x => x.province)
            return sortedProvinces
        } catch (e) {
            console.log(`[${tags.Error}] Failed to fetch provinces.`)
            console.error(e)
            throw e
        }
    }

    /**
     * #### Retrieves all cities available within the specified province.
     * @param province - The province name to filter cities by.
     * @returns A promise resolving to a deduplicated array of city names in that province.
     */
    async getCitiesByProvince(province: string): Promise<string[]> {
        //! province must be on proper format
        try {
            const cities = await this.db().where('province', province)
            const sortedCities = cities.map(x => x.city)
            return sortedCities
        } catch (e) {
            console.log(`[${tags.Error}] Failed to fetch cities for province ${province}.`)
            console.error(e)
            throw e
        }
    }

    /**
     * #### Searches for a province by a fuzzy query string, like a search engine.
     * ---
     * The result provides three representations of the matched province:
     * - `searchKey` — slugified form, for use with {@link getCitiesByProvince}
     * - `databaseKey` — raw key used for database lookups
     * - `original` — normalized, human-readable form for display
     * @param query - The search string to match against province names.
     * @returns A promise resolving to the best-matching {@link LocationSearchResult}.
     */
    async searchProvince(query: string): Promise<LocationSearchResult[] | null> {
        // somehow resolve"yogya" to "D.I. Yogyakarta", "jakarta" to "DKI Jakarta", etc
        const userQuery = slugify(query)

        const allProvinces = await this.getProvinces()
        const searchObj: LocationSearchResult[] = allProvinces.map(x => {
            return {
                searchKey: slugify(x), 
                original: x 
            }
        })

        const searcher = new FuzzySearch(searchObj, ['searchKey']);
        const res = searcher.search(userQuery)

        return res
    }

    /**
     * #### Searches for a city within a province by a fuzzy query string, like a search engine.
     * ---
     * The result provides two representations of the matched city:
     * - `searchKey` — slugified form, for use in further lookups
     * - `original` — human-readable form for display
     * @param province - The province to scope the city search.
     * @param query - The search string to match against city names.
     * @returns A promise resolving to the best-matching city result, omitting `databaseKey`.
     */
    async searchCity(province: string, query: string): Promise<Omit<LocationSearchResult, 'databaseKey'>[] | null> {
        // province must be on proper format
        const userQuery = slugify(query)

        const allCities = await this.getCitiesByProvince(province)
        const searchObj: Omit<LocationSearchResult, 'databaseKey'>[] = allCities.map(x => {
            return {
                searchKey: slugify(x),
                original: x
            }
        })

        const searcher = new FuzzySearch(searchObj, ['searchKey']);
        const res = searcher.search(userQuery)

        return res
    }
}