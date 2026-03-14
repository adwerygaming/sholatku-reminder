import { Module } from '@nestjs/common';
import { LocationController } from '../../API/v1/Location/location.controller.js';
import { LocationService } from './location.service.js';

@Module({
    imports: [],
    controllers: [LocationController],
    providers: [LocationService],
})
export class LocationModule { }