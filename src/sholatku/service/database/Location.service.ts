import FuzzySearch from 'fuzzy-search';
import LocationDatabaseClient from "../../../database/LocationDatabaseClient.js";

const Location = {
    async getAllRaw() {
        const allRaw = await LocationDatabaseClient.all<string[]>()
        return allRaw
    },

    async getAll() {
        const allRaw = await this.getAllRaw()
        const all = allRaw.map(x => {
            return {
                [x.id]: x.value
            }
        })

        return all
    },

    async getProvinces(): Promise<string[]> {
        const allRaw = await this.getAllRaw()
        const provinces = allRaw.map(x => x.id)
            .filter((v, i, a) => a.indexOf(v) === i)

        return provinces
    },

    async getCitiesByProvince(province: string): Promise<string[]> {
        const allRaw = await this.getAllRaw()

        const cities = allRaw
            .filter(x => x.id === province)
            .flatMap(x => x.value)
            .filter((v, i, a) => a.indexOf(v) === i)

        return cities
    },

    async searchProvince(query: string): Promise<string[]> {
        const allProvinces = await this.getProvinces()

        const searcher = new FuzzySearch(allProvinces);

        const res = searcher.search(query)

        return res
    },

    async searchCity(province: string, query: string) {
        const allCities = await this.getCitiesByProvince(province)

        const searcher = new FuzzySearch(allCities);

        const res = searcher.search(query)

        return res
    }
}

export default Location