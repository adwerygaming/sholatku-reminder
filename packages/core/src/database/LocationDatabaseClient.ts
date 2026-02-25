import { QuickDB } from "quick.db"
const LocationDatabaseClient = new QuickDB({ filePath: "db/PrayerkuLocation.sqlite" })

export default LocationDatabaseClient