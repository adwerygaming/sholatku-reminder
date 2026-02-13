import { ButtonBuilder, ButtonStyle, Colors, ContainerBuilder, MessageFlags } from "discord.js";
import SholatKuServiceHelper from "../../sholatku/service/helper/Helper.service.js";
import SholatKuService from "../../sholatku/service/SholatKu.service.js";
import { ModalLayout } from "../../types/Discord.types.js";
import tags from "../../utils/Tags.js";

export default {
    id: "reminder",
    async execute(client, interaction, data) {
        const action = data;

        if (action[0] == "subscribe") {
            if (action[1] == "answer") {
                if (action[2] == "province") {
                    const provinceValue = interaction.fields.getTextInputValue("province");

                    const provinceResults = await SholatKuService.Database.Location.searchProvince(provinceValue);
                    if (provinceResults.length === 0) {
                        // not found
                        return
                    }

                    const provinceFinal = provinceResults?.[0];
                    const provinceFinalFormmated = SholatKuServiceHelper.normalizeOutput(provinceFinal);

                    // await DiscordService.User(interaction.user.id).Preferences.Province.set(provinceFinal);
                    await SholatKuService.User(interaction.user.id).Province.set(provinceFinal);

                    const cities = await SholatKuService.Database.Location.getCitiesByProvince(provinceFinal);
                    const formmatedCities = cities.map((city, i) => `[${i + 1}] **${SholatKuServiceHelper.normalizeOutput(city)}**`).join('\n');

                    const nextStepBtn = new ButtonBuilder()
                        .setCustomId(`reminder_${interaction.user.id}_subscribe_answer_city`)
                        .setLabel('Answer')
                        .setStyle(ButtonStyle.Primary);

                    const cancelBtn = new ButtonBuilder()
                        .setCustomId(`reminder_${interaction.user.id}_subscribe_cancel`)
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary);

                    const confirmationContainer = new ContainerBuilder()
                        .setAccentColor(Colors.Green)
                        .addTextDisplayComponents(
                            (text) => text.setContent("-# Prayer Reminder Subscription")
                        )
                        .addTextDisplayComponents(
                            (text) => text.setContent(`Your Province has been updated to **${provinceFinalFormmated}**`)
                        )
                        .addSeparatorComponents((sep) => sep)
                        .addTextDisplayComponents(
                            (text) => text.setContent(`Available cities in province **${provinceFinalFormmated}**:\n${formmatedCities}`)
                        )
                        .addSeparatorComponents((sep) => sep)
                        .addTextDisplayComponents(
                            (text) => text.setContent(`Answer the city input for the next step. Use the exact city name as shown above.`)
                    )
                        .addActionRowComponents((row) => row.addComponents(nextStepBtn, cancelBtn))

                    if (interaction.isFromMessage()) {
                        await interaction.update({
                            components: [confirmationContainer],
                            flags: [MessageFlags.IsComponentsV2]
                        });
                    }
                } else if (action[2] == "city") {
                    const cityValue = interaction.fields.getTextInputValue("city");

                    // const province = await DiscordService.User(interaction.user.id).Preferences.Province.get();
                    const province = await SholatKuService.User(interaction.user.id).Province.get();
                    if (!province) {
                        // province not set
                        return
                    }
                    const provinceFormmated = SholatKuServiceHelper.normalizeOutput(province);

                    const cityResults = await SholatKuService.Database.Location.searchCity(province, cityValue);

                    if (cityResults.length === 0) {
                        // not found
                        return
                    }

                    const cityFinal = cityResults?.[0];
                    const cityFinalFormmated = SholatKuServiceHelper.normalizeOutput(cityFinal);

                    // await DiscordService.User(interaction.user.id).Preferences.City.set(cityFinal);
                    await SholatKuService.User(interaction.user.id).City.set(cityFinal);

                    console.log(`[${tags.Debug}] User ID: ${interaction.user.id}`);
                    console.log(`[${tags.Debug}] Final Location Set: ${province} - ${cityFinal}`);

                    const confirmationContainer = new ContainerBuilder()
                        .setAccentColor(Colors.Green)
                        .addTextDisplayComponents(
                            (text) => text.setContent("-# Prayer Reminder Subscription")
                        )
                        .addTextDisplayComponents(
                            (text) => text.setContent("You have successfully subscribed to prayer reminders. You will start receiving reminders based on your set location.")
                        )
                        .addSeparatorComponents((sep) => sep)
                        .addTextDisplayComponents(
                            (text) => text.setContent(`Province: **${provinceFormmated}**`)
                        )
                        .addTextDisplayComponents(
                            (text) => text.setContent(`City: **${cityFinalFormmated}**`)
                        )

                    if (interaction.isFromMessage()) {
                        await interaction.update({
                            components: [confirmationContainer],
                            flags: [MessageFlags.IsComponentsV2]
                        });
                    }
                }
            }
        } 
    },
} as ModalLayout