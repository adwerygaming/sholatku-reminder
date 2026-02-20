import moment, { Moment } from "moment-timezone";
import { SholatkuUser } from "../types/Users.types.js";
import { Location } from "./domain/Location.js";
import { PrayerScheduler } from "./domain/PrayerScheduler.js";
import { UserAccount } from "./domain/UserAccount.js";
import { UserManager } from "./domain/UserManager.js";
import { sholatkuClient } from "./Index.js";

// await DatabaseClient.table("users").deleteAll()
// await DatabaseClient.table("prayer_state").deleteAll()
// await DatabaseClient.table("user_prayer_state").deleteAll()

// const provTest = "yogya"
// const cityTest = "gunung"

// const provRes = await SholatKuService.Database.Location.searchProvince(provTest)
// console.log("Province Search Result:", provRes)
// const cityRes = await SholatKuService.Database.Location.searchCity(provRes?.original ?? provTest, cityTest)
// console.log("City Search Result:", cityRes)

setInterval(async () => {
    await check()
}, 5000);

await check()

async function check(): Promise<void> {
    let debugTime: Moment | undefined = undefined
    const useDebugTime = false

    if (useDebugTime) {
        debugTime = moment("11:50", "HH:mm")
    }

    const user = new UserManager()

    const users = await user.getAll()
    const usersMap = new Map<string, SholatkuUser[]>()

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const province = user.location?.province
        const city = user.location?.city

        if (!province || !city) continue;

        const locationKey = `${province}-${city}`

        if (!usersMap.has(locationKey)) {
            usersMap.set(locationKey, [])
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        usersMap.get(locationKey)!.push(user)
    }

    const thing = [...usersMap.entries()]

    for (let i = 0; i < thing.length; i++) {
        const res = thing[i];
        const locationKeyRaw = res[0]
        const users = res[1]

        const [province, city] = locationKeyRaw.split("-")

        if (!province || !city) continue;

        const prayerScheduler = new PrayerScheduler(province, city, debugTime)
        const location = new Location()

        const check = await prayerScheduler.cycleCheck()

        if (!check) continue;

        const provinceFinal = await location.searchProvince(province)
        const cityFinal = await location.searchCity(provinceFinal.original, city)

        for (let k = 0; k < check.length; k++) {
            const event = check[k];

            if (!event) continue;

            await sholatkuClient.emit(event.type, {
                event,
                province: {
                    databaseKey: province,
                    original: provinceFinal.original,
                    searchKey: provinceFinal.searchKey
                },
                city: {
                    databaseKey: city,
                    original: cityFinal.original,
                    searchKey: cityFinal.searchKey
                },
                users
            })
            
            // leave to this thing to update the last state
            for (let j = 0; j < users.length; j++) {
                const user = users[j];
                const userAccount = new UserAccount(user)

                const key = `${event.type}-${event.eventName}`
                const stateCheck = await userAccount.getPrayerState(key)

                if (event.type == "prayerTime" && !stateCheck) {
                    await userAccount.setPrayerState(key, true)
                } else if (event.type == "prayer_in_15m" && !stateCheck) {
                    await userAccount.setPrayerState(key, true)
                } else if (event.type == "prayer_in_30m" && !stateCheck) {
                    await userAccount.setPrayerState(key, true)
                }
            }
        }
    }
}