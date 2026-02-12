import moment from "moment-timezone"
import path from "path"
import { _dirname } from "../utils/Path.js"
import SholatKuService from "./SholatKuService.js"

const dataPath = path.join(_dirname, "..", "assets", "schedule.json")

const now = moment("17:58", "HH:mm")
const id = "123"
const province = "D.I. Yogyakarta"
const city = "Kab. Gunungkidul"

const check = await SholatKuService.checkPrayer({ province, city })

console.log(check)
