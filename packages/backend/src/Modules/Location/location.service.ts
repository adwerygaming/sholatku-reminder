/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { Location } from 'sholatku-reminder-core/src/sholatku/domain/Location.js';
import { LocationSearchResult } from 'sholatku-reminder-shared/types/Location.types.js';

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
        const data = await location.searchProvince(query)
        return data ?? []
    }

    async searchCity({ province, query }: SearchCityProp): Promise<LocationSearchResult[]> {
        const data = await location.searchCity(province, query)
        return data ?? []
    }
}
