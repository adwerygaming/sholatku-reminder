import { ButtonBuilder, ButtonStyle, Colors, ContainerBuilder, MessageFlags } from "discord.js";
import { Location } from "../../sholatku/domain/Location.js";
import { UserAccount } from "../../sholatku/domain/UserAccount.js";
import { UserManager } from "../../sholatku/domain/UserManager.js";
import { normalizeOutput } from "../../sholatku/helper/Helper.js";
import { ModalLayout } from "../../types/Discord.types.js";
import { UserProvider } from "../../types/Users.types.js";
import tags from "../../utils/Tags.js";

export default {
    id: "reminder",
    async execute(_client, interaction, data) {
        const action = data;

        if (action[0] == "subscribe") {
            if (action[1] == "answer") {
                if (action[2] == "province") {
                    const location = new Location();
                    const userManager = new UserManager();

                    const provinceValue = interaction.fields.getTextInputValue("province");

                    const provinceResult = await location.searchProvince(provinceValue);
                    if (!provinceResult) {
                        console.log(`[${tags.Debug}] Cannot find province matching user input: ${provinceValue}`);
                        // not found
                        return
                    }

                    const provinceFinal = provinceResult.original
                    const provinceFinalFormmated = normalizeOutput(provinceFinal);

                    const user = await userManager.resolve({
                        provider: UserProvider.Discord,
                        user: interaction.user
                    })

                    if (!user) {
                        return
                    }

                    const userAccount = new UserAccount(user)

                    // await DiscordService.User(interaction.user.id).Preferences.Province.set(provinceFinal);
                    await userAccount.setProvince(provinceFinal);

                    const cities = await location.getCitiesByProvince(provinceFinal);
                    const formmatedCities = cities.map((city, i) => `[${i + 1}] **${normalizeOutput(city)}**`).join('\n');

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

                    const userManager = new UserManager();
                    const location = new Location();

                    const user = await userManager.resolve({
                        provider: UserProvider.Discord,
                        user: interaction.user
                    })

                    if (!user) {
                        return
                    }

                    const userAccount = new UserAccount(user)

                    // const province = await DiscordService.User(interaction.user.id).Preferences.Province.get();
                    const province = await userAccount.getProvince()
                    if (!province) {
                        // province not set
                        return
                    }
                    const provinceFormmated = normalizeOutput(province);

                    const cityResult = await location.searchCity(province, cityValue);

                    if (!cityResult) {
                        // not found
                        return
                    }

                    const cityFinal = cityResult.original;
                    const cityFinalFormmated = normalizeOutput(cityFinal);

                    // await DiscordService.User(interaction.user.id).Preferences.City.set(cityFinal);
                    userAccount.setCity(cityFinal);

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