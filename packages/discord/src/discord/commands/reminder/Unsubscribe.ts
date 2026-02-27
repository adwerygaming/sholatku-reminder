import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, Colors, ContainerBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { UserAccount } from "../../../sholatku/domain/UserAccount.js";
import { UserManager } from "../../../sholatku/domain/UserManager.js";
import { SlashCommandLayout } from "../../../types/Discord.types.js";
import { UserProvider } from "../../../types/Subscription.types.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("unsubscribe")
        .setDescription("Unsubsribe from prayer reminders."),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        const userManager = new UserManager()

        const user = await userManager.resolve({
            provider: UserProvider.Discord,
            user: interaction.user
        })

        if (!user) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(
                    (text) => text.setContent("### Prayer Reminder Subscription"),
                )
                .addSeparatorComponents((sep) => sep)
                .addTextDisplayComponents(
                    (text) => text.setContent("An error occurred while trying to resolve your account. Please try again later."),
                )

            await interaction.reply({
                components: [errorContainer],
                flags: [MessageFlags.IsComponentsV2]
            })

            return
        }

        const userAccount = new UserAccount(user)

        const check = userAccount.isRegistered()

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