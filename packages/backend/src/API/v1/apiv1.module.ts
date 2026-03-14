/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { DiscordModule } from '../../Modules/Discord/discord.module.js';
import { LocationModule } from '../../Modules/Location/location.module.js';
import { SubscriptionsModule } from '../../Modules/Subscriptions/subscriptions.module.js';

@Module({
    imports: [DiscordModule, LocationModule, SubscriptionsModule],
    controllers: [],
    providers: [],
})
export class APIV1Module { }
