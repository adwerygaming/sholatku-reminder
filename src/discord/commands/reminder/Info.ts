import { ChatInputCommandInteraction, Client, Colors, ContainerBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import SholatKuService from "../../../sholatku/domain/PrayerScheduler.js";
import { SlashCommandLayout } from "../../../types/Discord.types.js";
import { SholatkuUserProvider } from "../../../types/SholatKu.types.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Check your prayer reminder configurations."),
    execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        const user = await SholatKuService.User().resolveUser({
            provider: SholatkuUserProvider.Discord,
            user: interaction.user
        })

        const check = await SholatKuService.User(user).isRegistered()

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

        const provinceNormalized = await SholatKuService.Helper.normalizeOutput(user.location?.province || "Unknown Province");
        const cityNormalized = await SholatKuService.Helper.normalizeOutput(user.location?.city || "Unknown City");

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