import FuzzySearch from 'fuzzy-search';
import LocationDatabaseClient from "../../../database/LocationDatabaseClient.js";
import SholatKuServiceHelper from '../helper/Helper.js';

interface SearchObject {
    searchKey: string;
    original: string;
    databaseKey: string;
}



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

    async getCitiesByProvince(provinceSlug: string): Promise<string[]> {
        const allRaw = await this.getAllRaw()

        const cities = allRaw
            .filter(x => x.id === provinceSlug)
            .flatMap(x => x.value)
            .filter((v, i, a) => a.indexOf(v) === i)

        return cities
    },

    async searchProvince(query: string): Promise<SearchObject> {
        const allProvinces = await this.getProvinces()

        const searchObj: SearchObject[] = allProvinces.map(x => {
            return { 
                searchKey: SholatKuServiceHelper.slugify(x), 
                databaseKey: x, 
                original: SholatKuServiceHelper.normalizeOutput(x) 
            }
        })

        const searcher = new FuzzySearch(searchObj, ['searchKey']);

        const res = searcher.search(SholatKuServiceHelper.slugify(query))

        return res?.[0]
    },

    async searchCity(province: string, query: string): Promise<Omit<SearchObject, 'databaseKey'>> {
        const allCities = await this.getCitiesByProvince(province)

        const searchObj: Omit<SearchObject, 'databaseKey'>[] = allCities.map(x => {
            return { searchKey: SholatKuServiceHelper.slugify(x), original: x }
        })

        const searcher = new FuzzySearch(searchObj, ['searchKey']);

        const res = searcher.search(SholatKuServiceHelper.slugify(query))

        return res?.[0]
    }
}

export default Location