import { QuickDB } from "quick.db"
const DatabaseClient = new QuickDB({ filePath: "db/prayerku.sqlite" })

export default DatabaseClient