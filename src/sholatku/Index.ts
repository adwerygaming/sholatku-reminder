import moment from "moment-timezone"
import path from "path"
import { _dirname } from "../utils/Path.js"
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

await SholatKuService.getAllLocations()