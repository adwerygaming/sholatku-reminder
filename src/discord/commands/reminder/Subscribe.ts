import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { SlashCommandLayout } from "../../types/Discord.types.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("subscribe")
        .setDescription("Subsribe to prayer reminders.")
        .addStringOption(option =>
            option.setName("province")
                .setDescription("City for prayer reminders")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("city")
                .setDescription("City for prayer reminders")
                .setRequired(true)
        ),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.reply({ content: "Pong!" });
    }
} as SlashCommandLayout;