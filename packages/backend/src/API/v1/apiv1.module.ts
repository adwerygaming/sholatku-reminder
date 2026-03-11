/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { DiscordModule } from './Discord/discord.module.js';

@Module({
    imports: [DiscordModule],
    controllers: [],
    providers: [],
})
export class APIV1Module {}
