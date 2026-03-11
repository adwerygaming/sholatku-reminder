import axios from "axios";
import { DiscordPartialGuild } from "../../shared/types/Discord.types.js";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1",
    withCredentials: true,
});

export class APIService {
    async getGuilds(): Promise<DiscordPartialGuild[]> {
        const { data } = await api.get<DiscordPartialGuild[]>("/discord/guilds");
        return data;
    }
}