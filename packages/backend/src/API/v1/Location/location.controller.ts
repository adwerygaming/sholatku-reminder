import { Controller, Get, Query } from '@nestjs/common';
import { LocationSearchResult } from 'sholatku-reminder-shared/types/Location.types.js';
import { LocationService } from '../../../Modules/Location/location.service.js';

interface GetProvinceDTO {
    query: string
}

interface GetCityDTO {
    province: string
    query: string
}

@Controller('api/v1/location')
export class LocationController {
    constructor(private readonly locationService: LocationService) {}

    @Get("province")
    async getProvince(@Query() { query }: GetProvinceDTO): Promise<LocationSearchResult[]> {
        let data = await this.locationService.searchProvince({ query })
        
        // Limit to 5 results
        if (data.length > 5) {
            data = data.slice(0, 5)
        }

        return data
    }

    @Get("city")
    async getCity(@Query() { province, query }: GetCityDTO): Promise<LocationSearchResult[]> {
        return await this.locationService.searchCity({ province, query })
    }
}
