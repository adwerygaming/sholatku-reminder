/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { Location } from 'sholatku-reminder-core/src/sholatku/domain/Location.js';
import { SubscriptionRepository } from 'sholatku-reminder-core/src/sholatku/domain/SubscriptionRepository.js';
import { SubscriptionFull } from 'sholatku-reminder-shared/types/SholatKu.types.js';
import { SubscriptionProvider } from 'sholatku-reminder-shared/types/Subscription.types.js';
import tags from 'sholatku-reminder-shared/utils/Tags.js';
import { AuthenticatedRequest } from '../Discord/discord.guard.js';
import { DiscordService } from '../Discord/discord.service.js';
import { CreateSubscriptionsBody } from './subscriptions.dto.js';

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly location: Location,
        private readonly subs: SubscriptionRepository,
        private readonly DiscordService: DiscordService
    ) {}

    async createSubscription(req: AuthenticatedRequest, { channelId, city, guildId, platform, province }: CreateSubscriptionsBody): Promise<SubscriptionFull | null> {
        const { discordId, userId } = await this.DiscordService.resolveUser(req)

        if (!channelId || !city || !guildId || !platform || !province) {
            throw new Error("Missing required fields");
        }

        if (platform === "discord") {
            // TODO: add one more validation for channelId and guildId, make sure they are valid snowflakes
            try {
                const location = await this.location.getByLocation({
                    province,
                    city
                })

                if (!location) {
                    console.log(`[${tags.Error}] Location ${province}, ${city} not found.`)
                    throw new Error(`Can't find location`);
                }

                const res = await this.subs.register({
                    locationId: location.id,
                    providerName: SubscriptionProvider.Discord,
                    metadata: {
                        authorId: discordId, // discord id
                        channelId,
                        guildId
                    },
                    userId
                })

                return res
            } catch (e) {
                console.error(`[${tags.Error}] createSubscription failed`, e);
                throw new Error(`Failed to create subscription`);
            }
        } else {
            return null
        }
    }
}
