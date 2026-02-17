import { ButtonBuilder, LabelBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { ButtonStyle, Colors, ContainerBuilder, MessageFlags, TextInputStyle } from "discord.js";
import SholatKuService from "../../sholatku/service/SholatKu.service.js";
import { ButtonLayout } from "../../types/Discord.types.js";
import { SholatkuUserProvider } from "../../types/SholatKu.types.js";
import tags from "../../utils/Tags.js";

export default {
    id: "reminder",
    async execute(_client, interaction, data) {
        const action = data;

        console.log(action)

        if (action[0] == "subscribe") {
            if (action[1] == "start") {
                await interaction.deferUpdate();

                const provinces = await SholatKuService.Database.Location.getProvinces();
                const formmatedProvinces = provinces.map((province, i) => `[${i + 1}] **${SholatKuService.Helper.normalizeOutput(province)}**`).join('\n');

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
                        (text) => text.setContent(`Available provinces:\n${formmatedProvinces}`)
                    )
                    .addSeparatorComponents((sep) => sep)
                    .addTextDisplayComponents(
                        (text) => text.setContent("**Click the answer button** and **type your province name**.")
                    )
                    .addSeparatorComponents((sep) => sep)
                    .addActionRowComponents((row) => row.addComponents(provinceAnswerModalBtn, cancelBtn))

                await interaction.editReply({
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
                        .setRequired(true);

                    const provinceLabel = new LabelBuilder()
                        .setLabel("Province")
                        .setDescription("Enter your province for prayer reminders.")
                        .setTextInputComponent(provinceInput)

                    modal.addLabelComponents(provinceLabel);

                    await interaction.showModal(modal);
                } else if (action[2] == "city") {
                    const modal = new ModalBuilder()
                        .setCustomId(`reminder_${interaction.user.id}_subscribe_answer_city`)
                        .setTitle("City Input");

                    const cityInput = new TextInputBuilder()
                        .setCustomId("city")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("e.g. Gunungkidul")
                        .setRequired(true);

                    const cityLabel = new LabelBuilder()
                        .setLabel("City")
                        .setDescription("Enter your city for prayer reminders.")
                        .setTextInputComponent(cityInput)

                    modal.addLabelComponents(cityLabel);

                    await interaction.showModal(modal);
                }
            }
        } else if (action[0] == "unsubscribe") {
            if (action[1] == "yes") {
                try {
                    await interaction.deferUpdate();

                    const user = await SholatKuService.User().resolveUser({
                        provider: SholatkuUserProvider.Discord,
                        user: interaction.user
                    })

                    await SholatKuService.User(user).unregister();

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(Colors.Green)
                        .addTextDisplayComponents(
                            (text) => text.setContent("### Prayer Reminder Subscription"),
                        )
                        .addSeparatorComponents((sep) => sep)
                        .addTextDisplayComponents(
                            (text) => text.setContent("**You have successfully unsubscribed from prayer reminders.**"),
                        )
                        .addTextDisplayComponents(
                            (text) => text.setContent("We won't send you any prayer reminders anymore. You can subscribe again anytime."),
                        )

                    await interaction.editReply({
                        components: [successContainer],
                        flags: [MessageFlags.IsComponentsV2]
                    })
                } catch (e) {
                    console.log(`[${tags.Error}] Failed to unsubscribe user ID: ${interaction.user.id} from prayer reminders.`)
                    console.error(e);

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(Colors.DarkRed)
                        .addTextDisplayComponents(
                            (text) => text.setContent("### Prayer Reminder Subscription"),
                        )
                        .addSeparatorComponents((sep) => sep)
                        .addTextDisplayComponents(
                            (text) => text.setContent("**An error occurred while trying to unsubscribe you from prayer reminders.**"),
                        )
                        .addTextDisplayComponents(
                            (text) => text.setContent("Please try again later."),
                        )

                    await interaction.editReply({
                        components: [errorContainer],
                        flags: [MessageFlags.IsComponentsV2]
                    })
                }
            }
        }
    },
} as ButtonLayout