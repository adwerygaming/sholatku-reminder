import { ButtonBuilder, ButtonStyle, Colors, ContainerBuilder, MessageFlags } from "discord.js";
import SholatKuService from "../../sholatku/domain/PrayerScheduler.js";
import SholatKuServiceHelper from "../../sholatku/helper/Helper.js";
import { ModalLayout } from "../../types/Discord.types.js";
import { SholatkuUserProvider } from "../../types/SholatKu.types.js";
import tags from "../../utils/Tags.js";

export default {
    id: "reminder",
    async execute(_client, interaction, data) {
        const action = data;

        if (action[0] == "subscribe") {
            if (action[1] == "answer") {
                if (action[2] == "province") {
                    const provinceValue = interaction.fields.getTextInputValue("province");

                    const provinceResult = await SholatKuService.Database.Location.searchProvince(provinceValue);
                    if (!provinceResult) {
                        console.log(`[${tags.Debug}] Cannot find province matching user input: ${provinceValue}`);
                        // not found
                        return
                    }

                    const provinceFinal = provinceResult.original
                    const provinceFinalFormmated = SholatKuServiceHelper.normalizeOutput(provinceFinal);

                    const user = await SholatKuService.User().resolveUser({
                        provider: SholatkuUserProvider.Discord,
                        user: interaction.user
                    })

                    // await DiscordService.User(interaction.user.id).Preferences.Province.set(provinceFinal);
                    await SholatKuService.User(user).Province.set(provinceFinal);

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

                    const user = await SholatKuService.User().resolveUser({
                        provider: SholatkuUserProvider.Discord,
                        user: interaction.user
                    })

                    // const province = await DiscordService.User(interaction.user.id).Preferences.Province.get();
                    const province = await SholatKuService.User(user).Province.get();
                    if (!province) {
                        // province not set
                        return
                    }
                    const provinceFormmated = SholatKuServiceHelper.normalizeOutput(province);

                    const cityResult = await SholatKuService.Database.Location.searchCity(province, cityValue);

                    if (!cityResult) {
                        // not found
                        return
                    }

                    const cityFinal = cityResult.original;
                    const cityFinalFormmated = SholatKuServiceHelper.normalizeOutput(cityFinal);

                    // await DiscordService.User(interaction.user.id).Preferences.City.set(cityFinal);
                    await SholatKuService.User(user).City.set(cityFinal);

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