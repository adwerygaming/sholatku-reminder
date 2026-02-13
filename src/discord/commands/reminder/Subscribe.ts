import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, Colors, ContainerBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { SlashCommandLayout } from "../../../types/Discord.types.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("subscribe")
        .setDescription("Subsribe to prayer reminders."),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        const startBtn = new ButtonBuilder()
            .setCustomId(`reminder_${interaction.user.id}_subscribe_start`)
            .setLabel('Continue')
            .setStyle(ButtonStyle.Primary);

        const cancelBtn = new ButtonBuilder()
            .setCustomId(`reminder_${interaction.user.id}_subscribe_cancel`)
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const startContainer = new ContainerBuilder()
            .setAccentColor(Colors.Blurple)
            .addTextDisplayComponents(
                (text) => text.setContent("### Prayer Reminder Subscription"),
            )
            .addSeparatorComponents((sep) => sep)
            .addTextDisplayComponents(
                (text) => text.setContent("We will ask you about your province and city. Continue?"),
            )
            .addActionRowComponents((row) => row.addComponents(startBtn, cancelBtn))

        await interaction.reply({
            components: [startContainer],
            flags: [MessageFlags.IsComponentsV2]
        })
    }
} as SlashCommandLayout;