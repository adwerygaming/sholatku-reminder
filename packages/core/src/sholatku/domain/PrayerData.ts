import axios from "axios"
import { Knex } from "knex"
import moment from "moment-timezone"
import DatabaseClient from "../../database/DatabaseClient.js"
import { PrayerDataSchema } from "../../types/Database.types.js"
import { BaseLocation } from "../../types/Location.types.js"
import { APIResponse, PrayerName, PrayerTime, PrayerTimeData } from "../../types/Prayer.types.js"
import tags from "../../utils/Tags.js"
import { convertTimeToMoment } from "../helper/Helper.js"
import { Location } from "./Location.js"

export class PrayerData {
    private readonly locationId: string
    private db(): Knex.QueryBuilder<PrayerDataSchema, PrayerDataSchema[]> {
        return DatabaseClient<PrayerDataSchema>("prayerData")
    }

    constructor(
        locationId: string,
    ) {
        this.locationId = locationId
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
                    time: convertTimeToMoment(value as string)
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

        const provinceResult = await location.searchProvince(province)

        if (!provinceResult) {
            console.log(`[${tags.Error}] Fetching prayer data for province "${province}" failed. Province not found.`)
            return []
        }

        const cityResult = await location.searchCity(provinceResult.original, city)

        if (!cityResult) {
            console.log(`[${tags.Error}] Fetching prayer data for city "${city}" failed. City not found.`)
            return []
        }

        const url = `https://equran.id/api/v2/imsakiyah`
        const body = {
            provinsi: provinceResult.original,
            kabkota: cityResult.original
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
        const res = await this.db()
            .select("prayerTimes")
            .where("locationId", this.locationId)

        if (!res || res.length === 0) {
            // fetch from API
            const location = new Location()
            const locationData = await location.getById(this.locationId)

            if (!locationData) {
                console.log(`[${tags.Error}] Failed to resolve location for id ${this.locationId}`)
                return null
            }

            const fetched = await this.fetch({
                city: locationData.city,
                province: locationData.province
            })

            if (fetched.length === 0) {
                console.log(`[${tags.Error}] Failed to fetch prayer data for ${locationData.city}, ${locationData.province}`)
                return null
            }

            await this.set(fetched)

            // should i replace res with fetched data? or just fetch again? race condition? recursive?
            return await this.get()
        }

        const mapped = res.map(x => {
            return x.prayerTimes
        }).flat()

        return mapped
    }

    /**
     * #### Write PrayerTimeData (30 days) to the database for this location.
     * @param data PrayerTimeData for this locaton
     */
    async set(data: PrayerTimeData[]): Promise<PrayerDataSchema[]> {
        // locationId is unique btw
        const res = await this.db()
            .insert({
                createdAt: moment().toISOString(),
                locationId: this.locationId,
                prayerTimes: data
            })
            .onConflict("locationId")
            .merge(["prayerTimes", "createdAt"])
            .returning("*")

        return res
    }
}