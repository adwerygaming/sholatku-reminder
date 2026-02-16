import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, Colors, ContainerBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import SholatKuService from "../../../sholatku/service/SholatKu.service.js";
import { SlashCommandLayout } from "../../../types/Discord.types.js";
import { SholatkuUserProvider } from "../../../types/SholatKu.types.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("subscribe")
        .setDescription("Subsribe to prayer reminders."),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        const user = await SholatKuService.User().resolveUser({
            provider: SholatkuUserProvider.Discord,
            user: interaction.user
        })
        const check = SholatKuService.User(user).isRegistered()

        if (!check) {
            const noContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent("### Prayer Reminder Subscription"),
                )
                .addSeparatorComponents((sep) => sep)
                .addTextDisplayComponents(
                    (text) => text.setContent("**You don't have active subscription.**"),
                )

            await interaction.reply({
                components: [noContainer],
                flags: [MessageFlags.IsComponentsV2]
            })

            return
        }

        const proceedBtn = new ButtonBuilder()
            .setCustomId(`reminder_${interaction.user.id}_unsubscribe_yes`)
            .setLabel("Yes, Unsubscribe")
            .setStyle(ButtonStyle.Primary)

        const cancelBtn = new ButtonBuilder()
            .setCustomId(`reminder_${interaction.user.id}_unsubscribe_cancel`)
            .setLabel("Abort")
            .setStyle(ButtonStyle.Secondary)

        const confirmationContainer = new ContainerBuilder()
            .setAccentColor(Colors.Blurple)
            .addTextDisplayComponents(
                (text) => text.setContent("### Prayer Reminder Subscription"),
            )
            .addSeparatorComponents((sep) => sep)
            .addTextDisplayComponents(
                (text) => text.setContent("Are you sure want to unsubscribe from prayer reminders? You can subscribe again anytime."),
            )
            .addActionRowComponents((row) => row.addComponents(proceedBtn, cancelBtn))

        await interaction.reply({
            components: [confirmationContainer],
            flags: [MessageFlags.IsComponentsV2]
        })
    }
} as SlashCommandLayout;