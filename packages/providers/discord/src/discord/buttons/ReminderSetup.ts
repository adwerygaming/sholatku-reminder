import { ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags } from "discord.js";
import { TemporaryData } from "sholatku-reminder-shared/database/TemporaryData.js";
import tags from "sholatku-reminder-shared/utils/Tags.js";
import { ButtonLayout, InteractionData } from "../../types/Discord.types.js";
import { ReminderSetupData } from "../commands/reminder/Setup.js";

export default {
    id: "reminder",
    async execute(_client, interaction, interactionKey) {
        const interactionData = await TemporaryData.get<InteractionData>({ key: interactionKey })

        if (!interactionData) {
            const noInteractionDataContainer = new ContainerBuilder()
                .addTextDisplayComponents(text => text.setContent("No interaction data found. Please start the setup process again."))

            await interaction.reply({
                components: [noInteractionDataContainer],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            })
            return
        }

        const data = interactionData.data as ReminderSetupData
        const section = data.section
        const action = interactionData.action

        console.log(data)
        console.log(`[${tags.Debug}] Section:`, section)
        console.log(`[${tags.Debug}] Action:`, action)

        // const enterCityModalBtn = new ButtonBuilder()
        //     .setCustomId(`reminder_${interactionKey}_custom`)
        //     .setLabel("Enter City")
        //     .setStyle(ButtonStyle.Primary)

        if (action === "start") {
            // PROVINCE SETUP
            const enterProvinceData: ReminderSetupData = {
                section: "province",
                ...data
            }

            const enterProvinceInteractionData: InteractionData = {
                action: "custom",
                ...interactionData,
                data: enterProvinceData
            }

            const enterProvinceTemp = await TemporaryData.set({ data: enterProvinceInteractionData })

            const enterProvinceModalBtn = new ButtonBuilder()
                .setCustomId(`reminder_${enterProvinceTemp.key}_custom`)
                .setLabel("Enter Province")
                .setStyle(ButtonStyle.Primary)

            const startContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                    (text) => text.setContent(`Hello <@${data.authorId}>! Let's begin the setup process for Sholatku Reminder.`)
                )
                .addTextDisplayComponents(
                    (text) => text.setContent(`Please use buttons below to enter your province and city. This information will be used to determine the prayer times for your location.`)
                )
                .addActionRowComponents(
                    (row) => row.addComponents(enterProvinceModalBtn)
                )

            // show input province & city btn
            await interaction.update({
                components: [startContainer],
                flags: [MessageFlags.IsComponentsV2]
            })
        } else if (action === "cancel") {
            await TemporaryData.remove({ key: interactionKey })

            const cancelCon = new ContainerBuilder()
                .addTextDisplayComponents(text => text.setContent("Setup process has been cancelled."))
            
            await interaction.update({
                components: [cancelCon],
                flags: [MessageFlags.IsComponentsV2]
            })
            return
        } else if (action === "custom") {
            if (section === "province") {
                // show input province modal
                // await interaction.showModal()
            } else if (section === "city") {
                // show input city modal
                // await interaction.showModal()
            }
        }
    },
} as ButtonLayout