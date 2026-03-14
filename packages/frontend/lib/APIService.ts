import axios from "axios";
import { DiscordPartialGuild } from "sholatku-reminder-shared/types/Discord.types.js";
import { LocationSearchResult } from "sholatku-reminder-shared/types/Location.types.js";
import { DiscordChannelRequestResponse } from "sholatku-reminder-shared/types/RPC.types.js";
import { SubscriptionFull } from "sholatku-reminder-shared/types/SholatKu.types.js";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1",
    withCredentials: true,
});

export interface SubscribeProp {
    platform: string
    province: string,
    city: string,
    guildId: string,
    channelId: string,
}

export class APIService {
    async subscribe({ platform, province, city, guildId, channelId }: SubscribeProp): Promise<SubscriptionFull | null> {
        const { data } = await api.post<SubscriptionFull | null>("/subscriptions/create", {
            platform,
            province,
            city,
            guildId,
            channelId
        });
        return data;
    }

    async fetchDiscordGuilds(): Promise<DiscordPartialGuild[]> {
        const { data } = await api.get<DiscordPartialGuild[]>("/discord/guilds");
        return data;
    }

    async fetchDiscordGuildChannels(guildId: string): Promise<DiscordChannelRequestResponse[]> {
        const { data } = await api.get<DiscordChannelRequestResponse[]>(`/discord/guilds/${guildId}/channels`);
        return data;
    }

    async searchProvince(query: string) {
        const { data } = await api.get<LocationSearchResult[]>("/location/province", {
            params: { query }
        });
        return data
    }

    async searchCity(province: string, query: string) {
        const { data } = await api.get<LocationSearchResult[]>("/location/city", {
            params: { province, query }
        });
        return data
    }
}