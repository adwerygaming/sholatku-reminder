import axios from "axios";
import fs from "fs";
import path from "path";
import { QuickDB } from "quick.db";
import SholatKuServiceHelper from "../sholatku/service/helper/Helper.service.js";
import { _dirname } from "../utils/Path.js";
import { sleep } from "../utils/Sleep.js";

const locationPath = path.join(_dirname, "..", "assets", "locations")

function getProvincesList() {
    const filePath = path.join(locationPath, "provinces.json")
    const file = fs.readFileSync(filePath, "utf-8")
    const res = JSON.parse(file) as string[]

    return res
}

const provinces = getProvincesList()

const db = new QuickDB({ filePath: "./locations.sqlite" })

await db.init()

for (let i = 0; i < provinces.length; i++) {
    const province = provinces[i];
    const provinceName = SholatKuServiceHelper.normalize(province)
    
    console.log(provinceName)

    const url = "https://equran.id/api/v2/imsakiyah/kabkota"

    await axios.post(url, {
        provinsi: province
    }).then(async (res) => {
        const data = res.data.data as string[]
        console.log(data)

        await db.set(provinceName, data)
    })

    await sleep(500)
}