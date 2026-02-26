import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeInput } from "../sholatku/helper/Helper.js";
import { sleep } from "../utils/Sleep.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const locationPath = path.join(__dirname, "..", "..", "..", "..", "assets", "locations")
const outputPath = path.join(locationPath, "locations.json")

const rootApiUrl = "https://equran.id/api/v2/imsakiyah"

type LocationEntry = {
    province: string
    city: string
}

async function fetchProvinces(): Promise<string[]> {
    const url = `${rootApiUrl}/provinsi`
    const res = await axios.get(url)
    return res.data.data as string[]
}

const provinces = await fetchProvinces()
const locations: LocationEntry[] = []

for (let i = 0; i < provinces.length; i++) {
    const province = provinces[i];
    const provinceName = normalizeInput(province)

    console.log(`[${i + 1}/${provinces.length}] Scraping: ${province}`)

    const url = `${rootApiUrl}/kabkota`

    await axios.post(url, {
        provinsi: province
    }).then((res) => {
        const cities = res.data.data as string[]

        for (const city of cities) {
            locations.push({ province: provinceName, city })
        }

        console.log(`   ↳ ${cities.length} cities found.`)
    }).catch((err) => {
        console.error(`   ↳ Failed: ${err.message}`)
    })

    await sleep(200)
}

fs.mkdirSync(locationPath, { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(locations, null, 2), "utf-8")

console.log(`\nDone. ${locations.length} total locations written to assets/locations/locations.json`)