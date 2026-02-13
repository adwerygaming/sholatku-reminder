import fs from "fs"
import path from "path";
import { _dirname } from "../utils/Path.js";
import { sleep } from "../utils/Sleep.js";
import axios from "axios";

const locationPath = path.join(_dirname, "..", "assets", "locations")

function getProvincesList() {
    const filePath = path.join(locationPath, "provinces.json")
    const file = fs.readFileSync(filePath, "utf-8")
    const res = JSON.parse(file) as string[]

    return res
}

const provinces = getProvincesList()

for (let i = 0; i < provinces.length; i++) {
    const province = provinces[i];
    console.log(province)

    const url = "https://equran.id/api/v2/imsakiyah/kabkota"

    await axios.post(url, {
        provinsi: province
    }).then(async (res) => {
        const data = res.data.data as string[]
        console.log(data)

        await fs.appendFileSync(`${locationPath}/final.json`, `
            "${province}": [${data.join(",")}]
        `);
    })

    await sleep(5000)
}