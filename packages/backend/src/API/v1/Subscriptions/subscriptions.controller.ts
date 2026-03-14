import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SubscriptionFull } from 'sholatku-reminder-shared/types/SholatKu.types.js';
import { AuthenticatedRequest, DiscordGuard } from '../../../Modules/Discord/discord.guard.js';
import { CreateSubscriptionsBody } from '../../../Modules/Subscriptions/subscriptions.dto.js';
import { SubscriptionsService } from '../../../Modules/Subscriptions/subscriptions.service.js';

@Controller("api/v1/subscriptions")
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Post("create")
    @UseGuards(DiscordGuard)
    subscribe(@Req() req: AuthenticatedRequest, @Body() body: CreateSubscriptionsBody): Promise<SubscriptionFull | null> {
        const data = this.subscriptionsService.createSubscription(req, body)
        return data
    }
}