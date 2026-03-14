/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { Location } from 'sholatku-reminder-core/src/sholatku/domain/Location.js';
import { LocationSearchResult } from 'sholatku-reminder-shared/types/Location.types.js';
import tags from 'sholatku-reminder-shared/utils/Tags.js';

interface SearchProvinceProp {
    query: string
}

interface SearchCityProp {
    province: string,
    query: string
}

const location = new Location()

@Injectable()
export class LocationService {
    async searchProvince({ query }: SearchProvinceProp): Promise<LocationSearchResult[]> {
        try {
            const data = await location.searchProvince(query)
            return data ?? []
        } catch (e) {
            console.error(`[${tags.Error}] searchProvince failed`, e)
            return []
        }
    }

    async searchCity({ province, query }: SearchCityProp): Promise<LocationSearchResult[]> {
        try {
            const data = await location.searchCity(province, query)
            return data ?? []
        } catch (e) {
            console.error(`[${tags.Error}] searchCity failed`, e)
            return []
        }
    }
}
