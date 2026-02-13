import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { SlashCommandLayout } from "../../../ts-discord-bot-starter/src/types/DiscordTypes.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong!"),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.reply({ content: "Pong!" });
    }
} as SlashCommandLayout;