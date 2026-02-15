import FuzzySearch from 'fuzzy-search';
import LocationDatabaseClient from "../../../database/LocationDatabaseClient.js";

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
     * Retrieves all cities within a specific province.
     * @param {string} province - The name of the province to filter cities by
     * @returns {Promise<string[]>} A promise that resolves to an array of unique city names in the province
     */
    async getCitiesByProvince(province: string): Promise<string[]> {
        const allRaw = await this.getAllRaw()

        const cities = allRaw
            .filter(x => x.id === province)
            .flatMap(x => x.value)
            .filter((v, i, a) => a.indexOf(v) === i)

        return cities
    },

    /**
     * Performs a fuzzy search on provinces based on a query string.
     * @param {string} query - The search query to match against province names
     * @returns {Promise<string[]>} A promise that resolves to an array of matching province names
     */
    async searchProvince(query: string): Promise<string[]> {
        const allProvinces = await this.getProvinces()

        const searcher = new FuzzySearch(allProvinces);

        const res = searcher.search(query)

        return res
    },

    /**
     * Performs a fuzzy search on cities within a specific province based on a query string.
     * @param {string} province - The province to search cities within
     * @param {string} query - The search query to match against city names
     * @returns {Promise<string[]>} A promise that resolves to an array of matching city names
     */
    async searchCity(province: string, query: string) {
        const allCities = await this.getCitiesByProvince(province)

        const searcher = new FuzzySearch(allCities);

        const res = searcher.search(query)

        return res
    }
}

export default Location