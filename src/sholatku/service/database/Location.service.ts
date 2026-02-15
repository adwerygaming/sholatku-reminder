import Fuse from 'fuse.js';
import LocationDatabaseClient from "../../../database/LocationDatabaseClient.js";
import tags from '../../../utils/Tags.js';
import SholatKuServiceHelper from '../helper/Helper.service.js';

const Location = {
    /**
     * Retrieves all raw location data from the database.
     * @returns {Promise<string[]>} A promise that resolves to an array of raw location records
     */
    async getAllRaw() {
        const allRaw = await LocationDatabaseClient.all<string[]>()
        return allRaw
    },

    /**
     * Retrieves all locations formatted as objects with id as the key.
     * @returns {Promise<Array<{[key: string]: any}>>} A promise that resolves to an array of location objects
     */
    async getAll() {
        const allRaw = await this.getAllRaw()
        const all = allRaw.map(x => {
            return {
                [x.id]: x.value
            }
        })

        return all
    },

    /**
     * Retrieves a list of all unique provinces.
     * @returns {Promise<string[]>} A promise that resolves to an array of unique province names
     */
    async getProvinces(): Promise<string[]> {
        const allRaw = await this.getAllRaw()
        const provinces = allRaw.map(x => x.id)
            .filter((v, i, a) => a.indexOf(v) === i)

        return provinces
    },

    /**
     * Retrieves all cities within a specific province from the database.
     * @param {string} province - The name of the province to filter cities by
     * @returns {Promise<string[]>} A promise that resolves to an array of unique city names in the province
     */
    async getCitiesByProvince(provinceId: string): Promise<string[]> {
        console.log(`[${tags.Debug}] Getting cities for province "${provinceId}"`)

        const allRaw = await this.getAllRaw()

        const match = allRaw.find(x => x.id === provinceId)

        if (!match) return []

        return [...new Set(match.value)]
    },

    /**
     * Performs a fuzzy search on provinces based on a query string.
     * @param {string} query - The search query to match against province names
     * @returns {Promise<string[]>} A promise that resolves to an array of matching province names
     */
    async searchProvince(query: string): Promise<{ original: string, normalized: string }[]> {
        console.log(`[${tags.Debug}] Searching for province "${query}"`)
        const provinces = await this.getProvinces()

        const fuse = new Fuse(
            provinces.map(p => ({
                original: p,
                normalized: SholatKuServiceHelper.normalizeOutput(p)
            })),
            {
                keys: ['normalized'],
                threshold: 0.3,
                ignoreLocation: true,
                includeScore: true
            }
        )

        const queryNormalized = SholatKuServiceHelper.normalizeOutput(query)

        const result = fuse.search(queryNormalized)

        console.log(result)

        return result.map(r => r.item)
    },

    /**
     * Performs a fuzzy search on cities within a specific province based on a query string.
     * @param {string} province - The province to search cities within
     * @param {string} query - The search query to match against city names
     * @returns {Promise<string[]>} A promise that resolves to an array of matching city names
     */
    async searchCity(province: string, query: string) {
        console.log(`[${tags.Debug}] Searching for city "${query}" in province "${province}"`)
        const allCities = await this.getCitiesByProvince(province)

        const fuse = new Fuse(
            allCities.map(p => ({
                original: p,
                normalized: SholatKuServiceHelper.normalizeOutput(p)
            })),
            {
                keys: ['normalized'],
                threshold: 0.3,
                ignoreLocation: true,
                includeScore: true
            }
        )

        const queryNormalized = SholatKuServiceHelper.normalizeOutput(query)

        const result = fuse.search(queryNormalized)

        console.log(result)

        return result.map(r => r.item.original)
    }
}

export default Location