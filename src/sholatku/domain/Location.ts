import FuzzySearch from 'fuzzy-search';
import LocationDatabaseClient from "../../database/LocationDatabaseClient.js";
import { LocationSearchResult } from '../../types/Location.types.js';
import { default as Helper, default as SholatKuServiceHelper } from '../helper/Helper.js';

export class Location {
    /**
     * Retrieve every location row (province slug with its raw city array) from the database.
     */
    private async getAllRaw() {
        const allRaw = await LocationDatabaseClient.all<string[]>()
        return allRaw
    }

    /**
     * Get locations grouped by province slug with cities as string arrays.
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
     * List all available province slugs.
     */
    async getProvinces(): Promise<string[]> {
        const allRaw = await this.getAllRaw()
        const provinces = allRaw.map(x => x.id)
            .filter((v, i, a) => a.indexOf(v) === i)

        return provinces
    }

    /**
     * List all unique cities for a given province slug.
     * @param province Province name or slug.
     */
    async getCitiesByProvince(province: string): Promise<string[]> {
        const allRaw = await this.getAllRaw()

        const provinceSlug = Helper.slugify(province)

        const cities = allRaw
            .filter(x => x.id === provinceSlug)
            .flatMap(x => x.value)
            .filter((v, i, a) => a.indexOf(v) === i)

        return cities
    }

    /**
     * Fuzzy-search province by query and return slug, database key, and display name.
     * @param query Province query text.
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
     * Fuzzy-search city within a province and return slug and display name.
     * @param province Province name or slug.
     * @param query City query text.
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