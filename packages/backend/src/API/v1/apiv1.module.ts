/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { DiscordModule } from './Discord/discord.module.js';
import { LocationModule } from './Location/location.module.js';

@Module({
    imports: [DiscordModule, LocationModule],
    controllers: [],
    providers: [],
})
export class APIV1Module {}
