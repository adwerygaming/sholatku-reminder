import { ChatInputCommandInteraction, Client, Colors, ContainerBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { UserAccount } from "../../../sholatku/domain/UserAccount.js";
import { UserManager } from "../../../sholatku/domain/UserManager.js";
import { normalizeOutput } from "../../../sholatku/helper/Helper.js";
import { SlashCommandLayout } from "../../../types/Discord.types.js";
import { UserProvider } from "../../../types/Users.types.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Check your prayer reminder configurations."),
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
                    (text) => text.setContent("Currently, **You are not subscribed to prayer reminders.**"),
                )
                .addTextDisplayComponents(
                    (text) => text.setContent("Start now by using `/reminder subscribe` command."),
                )

            await interaction.reply({
                components: [noContainer],
                flags: [MessageFlags.IsComponentsV2]
            })

            return
        }

        const provinceNormalized = await normalizeOutput(user.location?.province || "Unknown Province");
        const cityNormalized = await normalizeOutput(user.location?.city || "Unknown City");

        const okContainer = new ContainerBuilder()
            .setAccentColor(Colors.Green)
            .addTextDisplayComponents(
                (text) => text.setContent("### Prayer Reminder Subscription"),
            )
            .addSeparatorComponents((sep) => sep)
            .addTextDisplayComponents(
                (text) => text.setContent(`You are currently subscribed to prayer reminders for **${provinceNormalized}, ${cityNormalized}.**`),
            )
            .addTextDisplayComponents(
                (text) => text.setContent("We will send you prayer reminders **every day** and **5 minutes**, **15 minutes**, **30 minutes** before each prayer time."),
            )

        await interaction.reply({
            components: [okContainer],
            flags: [MessageFlags.IsComponentsV2]
        })
    }
} as SlashCommandLayout;