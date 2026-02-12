import moment from "moment-timezone"
import path from "path"
import { _dirname } from "../utils/Path.js"
import tags from "../utils/Tags.js"
import SholatKuService from "./SholatKuService.js"

const dataPath = path.join(_dirname, "..", "assets", "schedule.json")

const now = moment()
const id = "123"
const province = "D.I. Yogyakarta"
const city = "Kab. Gunungkidul"

