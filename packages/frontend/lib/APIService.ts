import axios from "axios";
import { DiscordPartialGuild } from "../../shared/types/Discord.types.js";
import { LocationSearchResult } from "../../shared/types/Location.types.js";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1",
    withCredentials: true,
});

export class APIService {
    async getGuilds(): Promise<DiscordPartialGuild[]> {
        const { data } = await api.get<DiscordPartialGuild[]>("/discord/guilds");
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