import { Colors, ContainerBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Location } from "sholatku-reminder-core/src/sholatku/domain/Location.js";
import { SubscriptionRepository } from "sholatku-reminder-core/src/sholatku/domain/SubscriptionRepository.js";
import { SubscriptionProvider } from "sholatku-reminder-core/src/types/Subscription.types.js";
import { SlashCommandLayout } from "../../../types/Discord.types.js";

export default {
    metadata: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Information about prayer time reminder subscription in this server"),
    execute: async (_client, interaction) => {
        if (!interaction.guild) {
            const noGuildContainer = new ContainerBuilder()
                .addTextDisplayComponents(text => text.setContent("This command can only be used in a server."))

            await interaction.reply({
                components: [noGuildContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            })

            return
        }

        const subRepo = new SubscriptionRepository()
        const location = new Location()

        const res = await subRepo.findByDiscordGuild(interaction.guild.id)
        const isDiscordSub = res?.providerName == SubscriptionProvider.Discord

        if (!res || !isDiscordSub) {
            const noSubContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkRed)
                .addTextDisplayComponents(text => text.setContent("No reminder subscription found for this server."))

            await interaction.reply({
                components: [noSubContainer],
                flags: [MessageFlags.IsComponentsV2]
            })
            return
        } else {
            const locationData = await location.getById(res.locationId)

            if (!locationData) {
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(Colors.DarkRed)
                    .addTextDisplayComponents(
                        text => text.setContent(`Subscription found for this server but location data with ID ${res.locationId} not found.`)
                    )

                await interaction.reply({
                    components: [errorContainer],
                    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                })
                return
            }
        
            const subContainer = new ContainerBuilder()
                .setAccentColor(Colors.DarkGreen)
                .addTextDisplayComponents(text => text.setContent(`-# ${interaction.guild?.name}\nThis guild is subscribed to prayer time reminders.`))
                .addSeparatorComponents(sep => sep)
                .addTextDisplayComponents(
                    text => text.setContent(`**Province**: ${locationData.province}`)
                )
                .addTextDisplayComponents(
                    text => text.setContent(`**City**: ${locationData.city}`)
                )
                .addTextDisplayComponents(
                    text => text.setContent(`**Reminder Channel**: <#${res.metadata.channelId}>`)
                )
                .addTextDisplayComponents(
                    text => text.setContent(`**Configured by**: <@${res.metadata.authorId}>`)
                )

            await interaction.reply({
                components: [subContainer],
                flags: [MessageFlags.IsComponentsV2]
            })
        }
    }
} as SlashCommandLayout