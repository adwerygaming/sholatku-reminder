import axios from "axios"
import moment from "moment-timezone"
import DatabaseClient from "../../database/DatabaseClient.js"
import { BaseLocation } from "../../types/Location.types.js"
import { APIResponse, PrayerName, PrayerTime, PrayerTimeData } from "../../types/Prayer.types.js"
import tags from "../../utils/Tags.js"
import { convertTimeToMoment, normalizeInput } from "../helper/Helper.js"
import { Location } from "./Location.js"

export class PrayerData {
    private readonly province
    private readonly city

    constructor(
        province: string,
        city: string,
        private readonly db = DatabaseClient.table("prayer_data")
    ) {
        this.province = normalizeInput(province)
        this.city = normalizeInput(city)
    }

    //! from all prayer data (30 days), filter only today prayer times
    /**
     * #### Get prayer times for a specified day
     * @param time
     * @returns {PrayerTime[]}
     */
    async getPrayerTimes(time: moment.Moment): Promise<PrayerTime[] | null> {
        const prayerData = await this.get()

        if (!prayerData) {
            return null
        }

        const now = time
        const currentDay = now.format("DD")

        const currentPrayerData = prayerData.find((x) => x.tanggal == Number(currentDay))

        if (!currentPrayerData) {
            return null
        }

        const formatted: PrayerTime[] = Object.entries(currentPrayerData)
            .filter((x) => x[0] !== "tanggal")
            .map(([key, value]) => {
                return {
                    prayerName: key as PrayerName,
                    time: convertTimeToMoment(value)
                }
            })

        return formatted
    }

    /**
     * #### Fetches prayer data from API, then return the data.
     * @param BaseLocation - contains province and city
     * @returns PrayerTimeData[] | null
     */
    async fetch({ city, province }: BaseLocation): Promise<PrayerTimeData[]> {
        const location = new Location()

        const provinceFinal = await location.searchProvince(province)
        const cityFinal = await location.searchCity(provinceFinal?.original, city)

        const url = `https://equran.id/api/v2/imsakiyah`
        const body = {
            provinsi: provinceFinal.original,
            kabkota: cityFinal.original
        }

        console.log(`[${tags.System}] Fetching prayer data for ${body.provinsi}, ${body.kabkota}`)

        const { data: res } = await axios.post<APIResponse>(url, body, {
            validateStatus: () => true
        })

        const output = res?.data?.imsakiyah ?? []

        return output
    }

    /**
     * #### Get prayer data for a location.
     * ---
     * Fetch API if not exist, fetch database if already exist
     * @returns 
     */
    async get(): Promise<PrayerTimeData[] | null> {
        // console.log(`[${tags.Debug}] Fetching prayer data FROM CACHE for ${this.city}, ${this.province}`)
        const res: PrayerTimeData[] | null = await this.db.get(`${this.province}.${this.city}`)

        //! if get no data, try passing non normalize input for both province and city.
        if (!res) {
            const data = await this.fetch({ province: this.province, city: this.city })

            if (data.length === 0 || !data || typeof data === "undefined") {
                return null
            }

            await this.set(data)
            return data
        }

        return res
    }

    /**
     * #### Write PrayerTimeData (30 days) to the database for this location.
     * @param data PrayerTimeData for this locaton
     */
    async set(data: PrayerTimeData[]): Promise<void> {
        await this.db.set(`${this.province}.${this.city}`, data)
    }
}