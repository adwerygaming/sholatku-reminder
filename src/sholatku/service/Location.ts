import FuzzySearch from 'fuzzy-search';
import LocationDatabaseClient from "../../database/LocationDatabaseClient.js";
import { LocationSearchResult } from '../../types/Location.types.js';
import SholatKuServiceHelper from './Helper.js';

export class Location {
    private async getAllRaw() {
        const allRaw = await LocationDatabaseClient.all<string[]>()
        return allRaw
    }

    async fetch() {
        const allRaw = await this.getAllRaw()
        const all = allRaw.map(x => {
            return {
                [x.id]: x.value
            }
        })

        return all
    }

    async getProvinces(): Promise<string[]> {
        const allRaw = await this.getAllRaw()
        const provinces = allRaw.map(x => x.id)
            .filter((v, i, a) => a.indexOf(v) === i)

        return provinces
    }

    async getCitiesByProvince(provinceSlug: string): Promise<string[]> {
        const allRaw = await this.getAllRaw()

        const cities = allRaw
            .filter(x => x.id === provinceSlug)
            .flatMap(x => x.value)
            .filter((v, i, a) => a.indexOf(v) === i)

        return cities
    }

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