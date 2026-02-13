import { ButtonBuilder, LabelBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { ButtonStyle, Colors, ContainerBuilder, MessageFlags, TextInputStyle } from "discord.js";
import { ButtonLayout } from "../../types/Discord.types.js";

export default {
    id: "reminder",
    async execute(client, interaction, data) {
        const action = data;

        if (action[0] == "subscribe") {
            if (action[1] == "start") {
                const provinceAnswerModalBtn = new ButtonBuilder()
                    .setCustomId(`reminder_${interaction.user.id}_subscribe_answer_province`)
                    .setLabel('Answer')
                    .setStyle(ButtonStyle.Primary);

                const cancelBtn = new ButtonBuilder()
                    .setCustomId(`reminder_${interaction.user.id}_subscribe_cancel`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary);

                const askProvince = new ContainerBuilder()
                    .setAccentColor(Colors.Blurple)
                    .addTextDisplayComponents(
                        (text) => text.setContent("-# Prayer Reminder Subscription")
                    )
                    .addTextDisplayComponents(
                        (text) => text.setContent("**Click the answer button** and **type your province name**.")
                    )
                    .addSeparatorComponents((sep) => sep)
                    .addActionRowComponents((row) => row.addComponents(provinceAnswerModalBtn, cancelBtn))

                await interaction.update({
                    components: [askProvince],
                    flags: [MessageFlags.IsComponentsV2]
                });
            } else if (action[1] == "answer") {
                if (action[2] == "province") {
                    const modal = new ModalBuilder()
                        .setCustomId(`reminder_${interaction.user.id}_subscribe_answer_province`)
                        .setTitle("Province Input");

                    const provinceInput = new TextInputBuilder()
                        .setCustomId("province")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("e.g. D.I. Yogyakarta")

                    const provinceLabel = new LabelBuilder()
                        .setLabel("Province")
                        .setDescription("Enter your province for prayer reminders.")
                        .setTextInputComponent(provinceInput)

                    modal.addLabelComponents(provinceLabel);

                    await interaction.showModal(modal);
                }
            }
        }
    },
} as ButtonLayout