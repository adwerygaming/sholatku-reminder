import { Module } from '@nestjs/common';
import { Location } from 'sholatku-reminder-core/src/sholatku/domain/Location.js';
import { SubscriptionRepository } from 'sholatku-reminder-core/src/sholatku/domain/SubscriptionRepository.js';
import { SubscriptionsController } from '../../API/v1/Subscriptions/subscriptions.controller.js';
import { DiscordModule } from '../Discord/discord.module.js';
import { SubscriptionsService } from './subscriptions.service.js';

@Module({
    imports: [DiscordModule],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, Location, SubscriptionRepository],
})
export class SubscriptionsModule { }
