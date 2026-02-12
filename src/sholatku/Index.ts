import moment from "moment-timezone"
import path from "path"
import { _dirname } from "../utils/Path.js"
import tags from "../utils/Tags.js"
import SholatKuService from "./SholatKuService.js"

const dataPath = path.join(_dirname, "..", "assets", "schedule.json")

const now = moment("14:58", "HH:mm")
const id = "12345"
const province = "DKI Jakarta"
const city = "Kota Jakarta"

// const check = await SholatKuService.checkPrayer({ province, city })
// console.log(check)

// const reg = await SholatKuService.User(id).register(province, city)
// console.log(reg)

const users = await SholatKuService.User().getAll()

// await DatabaseClient.table("prayer_state").deleteAll()
// await DatabaseClient.table("user_prayer_state").deleteAll()

const meong = new Map<string, string[]>()

for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userId = user.id
    const location = { province: user.province, city: user.city }
    const locationKey = `${location.province}-${location.city}`

    if (!meong.has(locationKey)) {
        meong.set(locationKey, [])
    }

    meong.get(locationKey)!.push(userId)
}

const thing = [...meong.entries()]

console.log(thing)

for (let i = 0; i < thing.length; i++) {
    const res = thing[i];
    const locationKeyRaw = res[0]
    const userIds = res[1]

    const [province, city] = locationKeyRaw.split("-")

    const check = await SholatKuService.checkPrayer({ province, city, debugTime: now })

    if (!check) continue;

    for (let k = 0; k < check.length; k++) {
        const event = check[k];

        if (!event) continue;

        for (let j = 0; j < userIds.length; j++) {
            const userId = userIds[j];
            const user = SholatKuService.User(userId)
            
            const key = `${event.type}-${event.eventName}`
            const stateCheck = await user.PrayerState.Get(key)

            if (event.type == "prayerTime" && !stateCheck) {
                const message = `[${province} - ${city}] Right now is ${event.time.format("HH:mm")}, Time for ${event.eventName}`
                sendToUser(userId, message)
                await user.PrayerState.Set(key, true)
            } else if (event.type == "prayer_in_15m" && !stateCheck) {
                const message = `[${province} - ${city}] In 15 minutes, ${event.eventName} will start.`
                sendToUser(userId, message)
                await user.PrayerState.Set(key, true)
            } else if (event.type == "prayer_in_30m" && !stateCheck) {
                const message = `[${province} - ${city}] In 30 minutes, ${event.eventName} will start.`
                sendToUser(userId, message)
                await user.PrayerState.Set(key, true)
            }

        }

    }
}

function sendToUser(userId: string, message: string) {
    console.log(`[${tags.System}] Sending message to user ${userId}: ${message}`)
}