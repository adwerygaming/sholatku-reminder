import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { TemporaryData } from "sholatku-reminder-shared/database/TemporaryData.js";
import { InteractionData, SlashCommandLayout } from "../../../types/Discord.types.js";

export interface ReminderSetupData {
    section?: "province" | "city"
    guildId: string,
    channelId: string,
    authorId: string
    province: string | null,
    city: string | null
}

export default {
    metadata: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Setup new reminder for your server"),
    execute: async (_client, integration) => {
        if (!integration.guild) {
            const noGuildContainer = new ContainerBuilder()
                .addTextDisplayComponents(text => text.setContent("This command can only be used in a server."))

            await integration.reply({
                components: [noGuildContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            })
            return
        }

        if (!integration.channel) {
            const noGuildContainer = new ContainerBuilder()
                .addTextDisplayComponents(text => text.setContent("Channel not found."))

            await integration.reply({
                components: [noGuildContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            })
            return
        }

        const setupData: ReminderSetupData = {
            guildId: integration.guild.id,
            channelId: integration.channelId,
            authorId: integration.user.id,
            province: null,
            city: null
        }

        const tempData: InteractionData = {
            guild: integration.guild,
            channel: integration.channel,
            user: integration.user,
            data: setupData
        }

        const cache = await TemporaryData.set({ data: tempData })

        const beginBtn = new ButtonBuilder()
            .setCustomId(`reminder_${cache.key}_start`)
            .setLabel("Begin Setup")
            .setStyle(ButtonStyle.Success)
        
        const cancelBtn = new ButtonBuilder()
            .setCustomId(`reminder_${cache.key}_cancel`)
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)

        const infoContainer = new ContainerBuilder()
            .addTextDisplayComponents(
                (text) => text.setContent(`Welcome to Sholatku Reminder`)
            )
            .addTextDisplayComponents(
                (text) => text.setContent(`For now, **this feature only available for :flag_id: Indonesia Region only.**`)
            )
            .addSeparatorComponents(sep => sep)
            .addTextDisplayComponents(
                (text) => text.setContent(`I will ask you to enter your location, it's a Province & City scale only. Not precise location.`)
            )
            .addTextDisplayComponents(
                (text) => text.setContent(`-# ${cache.key}`)
            )
            .addActionRowComponents(
                (row) => row.addComponents(beginBtn, cancelBtn)
            )

        await integration.reply({
            components: [infoContainer],
            flags: [MessageFlags.IsComponentsV2]
        })
    }
} as SlashCommandLayout