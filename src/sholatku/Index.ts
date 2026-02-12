import moment from "moment-timezone"
import path from "path"
import { _dirname } from "../utils/Path.js"
import tags from "../utils/Tags.js"
import SholatKuService from "./SholatKuService.js"

const dataPath = path.join(_dirname, "..", "assets", "schedule.json")

const now = moment("17:58", "HH:mm")
const id = "12345"
const province = "DKI Jakarta"
const city = "Kota Jakarta"


// const check = await SholatKuService.checkPrayer({ province, city })
// console.log(check)

// const reg = await SholatKuService.User(id).register(province, city)
// console.log(reg)

const locations = await SholatKuService.getAllLocations()

for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    
    console.log(`[${tags.System}] Checking prayer time for ${location.province} - ${location.city}`)
    const events = await SholatKuService.checkPrayer({ province: location.province, city: location.city, debugTime: now })
    console.log(events)

    if (!events) continue;

    for (let k = 0; k < events.length; k++) {
        const res = events[k];
        
        const user = await SholatKuService.User().getByLocation({ province: location.province, city: location.city })

        const check = await SholatKuService.User(user.userId).isRegistered()
        if (res.type == "")
    }

    console.log("")
}