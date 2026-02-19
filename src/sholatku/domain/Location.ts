import FuzzySearch from 'fuzzy-search';
import LocationDatabaseClient from "../../database/LocationDatabaseClient.js";
import { LocationSearchResult } from '../../types/Location.types.js';
import { default as Helper, default as SholatKuServiceHelper } from '../helper/Helper.js';

export class Location {
    /**
     * Retrieves all raw location data from the database.
     * Each entry contains a province key and an array of city strings.
     * @returns Raw location records from the database.
     */
    private async getAllRaw() {
        const allRaw = await LocationDatabaseClient.all<string[]>()
        return allRaw
    }

    /**
     * Fetches all location data, structured with the province as the key
     * and an array of city strings as the value.
     * @returns An array of objects mapping province keys to their city arrays.
     */
    async fetch() {
        const allRaw = await this.getAllRaw()
        const all = allRaw.map(x => {
            return {
                [x.id]: x.value
            }
        })

        return all
    }

    /**
     * Retrieves all available provinces as a deduplicated array of strings.
     * @returns A promise resolving to an array of province identifiers.
     */
    async getProvinces(): Promise<string[]> {
        const allRaw = await this.getAllRaw()
        const provinces = allRaw.map(x => x.id)
            .filter((v, i, a) => a.indexOf(v) === i)

        return provinces
    }

    /**
     * Retrieves all cities available within the specified province.
     * @param province - The province name to filter cities by.
     * @returns A promise resolving to a deduplicated array of city names in that province.
     */
    async getCitiesByProvince(province: string): Promise<string[]> {
        const allRaw = await this.getAllRaw()

        const provinceSlug = Helper.normalizeInput(province)

        const cities = allRaw
            .filter(x => x.id === provinceSlug)
            .flatMap(x => x.value)
            .filter((v, i, a) => a.indexOf(v) === i)

        return cities
    }

    /**
     * Searches for a province by a fuzzy query string, like a search engine.
     * The result provides three representations of the matched province:
     * - `searchKey` — slugified form, for use with {@link getCitiesByProvince}
     * - `databaseKey` — raw key used for database lookups
     * - `original` — normalized, human-readable form for display
     * @param query - The search string to match against province names.
     * @returns A promise resolving to the best-matching {@link LocationSearchResult}.
     */
    async searchProvince(query: string): Promise<LocationSearchResult> {
        const allProvinces = await this.getProvinces()

        const searchObj: LocationSearchResult[] = allProvinces.map(x => {
            return { 
                searchKey: SholatKuServiceHelper.slugify(x), 
                databaseKey: x, 
                original: SholatKuServiceHelper.normalizeOutput(x) 
            }
        })

        const searcher = new FuzzySearch(searchObj, ['searchKey']);

        const res = searcher.search(SholatKuServiceHelper.slugify(query))

        return res?.[0]
    }

    /**
     * Searches for a city within a province by a fuzzy query string, like a search engine.
     * The result provides two representations of the matched city:
     * - `searchKey` — slugified form, for use in further lookups
     * - `original` — human-readable form for display
     * @param province - The slugified province key to scope the city search.
     * @param query - The search string to match against city names.
     * @returns A promise resolving to the best-matching city result, omitting `databaseKey`.
     */
    async searchCity(province: string, query: string): Promise<Omit<LocationSearchResult, 'databaseKey'>> {
        const allCities = await this.getCitiesByProvince(province)

        const searchObj: Omit<LocationSearchResult, 'databaseKey'>[] = allCities.map(x => {
            return { searchKey: SholatKuServiceHelper.slugify(x), original: x }
        })

        const searcher = new FuzzySearch(searchObj, ['searchKey']);

        const res = searcher.search(SholatKuServiceHelper.slugify(query))

        return res?.[0]
    }
}