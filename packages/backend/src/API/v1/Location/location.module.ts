import { Module } from '@nestjs/common';
import { LocationController } from './location.controller.js';
import { LocationService } from '../../../Modules/Location/location.service.js';

@Module({
    imports: [],
    controllers: [LocationController],
    providers: [LocationService],
})
export class LocationModule { }