import FuzzySearch from 'fuzzy-search';
import { Knex } from 'knex';
import DatabaseClient from '../../database/DatabaseClient.js';
import { LocationSchema, SubscriptionSchema } from '../../types/Database.types.js';
import { LocationSearchResult } from '../../types/Location.types.js';
import { normalizeInput, slugify } from '../helper/Helper.js';

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
        const locationIds = await DatabaseClient<SubscriptionSchema>("subscriptions").distinct("locationId")
        const mappedLocIds = locationIds.map(x => x.locationId)

        const res = await this.db()
            .whereIn("id", mappedLocIds)

        return res
    }

    async getById(locationId: string): Promise<LocationSchema | null> {
        const res = await this.db()
            .select("*")
            .where("id", locationId)
            .first()

        if (!res) {
            return null
        }

        return res
    }

    async getByLocation({ province, city }: GetByLocationProp): Promise<LocationSchema | null> {
        const res = await this.db()
            .select("*")
            .where("province", province)
            .where("city", city)
            .first()

        if (!res) {
            return null
        }

        return res
    }

    /**
     * #### Fetches all location data, structured with the province as the key
     * ---
     * and an array of city strings as the value.
     * @returns An array of objects mapping province keys to their city arrays.
     */
    async fetch(): Promise<LocationFetchResult[]> {
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
    }

    /**
     * #### Retrieves all available provinces as a deduplicated array of strings.
     * @returns A promise resolving to an array of province identifiers.
     */
    async getProvinces(): Promise<string[]> {
        const provinces = await this.db().distinct('province')
        const sortedProvinces = provinces.map(x => x.province)
        return sortedProvinces
    }

    /**
     * #### Retrieves all cities available within the specified province.
     * @param province - The province name to filter cities by.
     * @returns A promise resolving to a deduplicated array of city names in that province.
     */
    async getCitiesByProvince(province: string): Promise<string[]> {
        //! province must be on proper format

        const cities = await this.db().where('province', province)
        const sortedCities = cities.map(x => x.city)
        return sortedCities
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
    async searchProvince(query: string): Promise<LocationSearchResult | null> {
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

        const data = res?.[0] ?? null

        if (!data) return null;

        return data
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
    async searchCity(province: string, query: string): Promise<Omit<LocationSearchResult, 'databaseKey'> | null> {
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

        const data = res?.[0] ?? null

        if (!data) return null

        return data
    }
}