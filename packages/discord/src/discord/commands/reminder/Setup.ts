import { ContainerBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommandLayout } from "../../../types/Discord.types.js";
import { ButtonBuilder } from "@discordjs/builders";

interface SetupDataProp {
    guildId: string,
    channelId: string,
    authorId: string
}

export default {
    metadata: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Setup new reminder for your server"),
    execute: async (client, integration) => {

        const beginBtn = new ButtonBuilder()
            .

        const infoContainer = new ContainerBuilder()
            .addTextDisplayComponents(
                text => text.setContent(`Welcome to Sholatku Reminder`)
            )
            .addTextDisplayComponents(
                text => text.setContent(`For now, **this feature only available for :flag_id: Indonesia Region only.**`)
            )
            .addSectionComponents(sep => sep)
            .addTextDisplayComponents(
                text => text.setContent(`I will ask you to enter your location, it's a Province & City scale only. Not precise location.`)
            )
    }
} as SlashCommandLayout