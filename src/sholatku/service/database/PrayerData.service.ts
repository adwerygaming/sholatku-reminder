import DatabaseClient from "../../../database/DatabaseClient.js"
import { Imsakiyah } from "../../../types/PrayerTimeData.types.js"
import tags from "../../../utils/Tags.js"
import SholatKuService from "../SholatKu.service.js"

/**
 * Creates a prayer data service instance for a specific location.
 * Provides methods to retrieve and store prayer time data from cache or API.
 * 
 * @param {string} province - The name of the province (will be normalized internally)
 * @param {string} city - The name of the city (will be normalized internally)
 * @returns {Object} An object with methods to get and set prayer data
 * @returns {Function} returns.get - Retrieves prayer data from cache or fetches from API if not cached
 * @returns {Function} returns.set - Stores prayer data in cache
 * 
 * @example
 * const prayerData = PrayerData('Jakarta', 'Jakarta Pusat');
 * const data = await prayerData.get();
 */
export default function PrayerData(province: string, city: string) {
    const db = DatabaseClient.table("prayer_data")
    
    const originalProvince = province
    const originalCity = city

    province = SholatKuService.Helper.normalizeInput(province)
    city = SholatKuService.Helper.normalizeInput(city)

    const chain = {
        /**
         * Retrieves prayer time data for the specified location.
         * First attempts to retrieve from cache. If not found, fetches from the SholatKu API
         * and automatically caches the result for future use.
         * 
         * @async
         * @returns {Promise<Imsakiyah[] | null>} A promise that resolves to:
         *   - Array of Imsakiyah objects containing prayer times for each day if successful
         *   - null if the data couldn't be fetched from the API or if the response is invalid
         * 
         * @throws May throw database-related errors during cache operations
         * 
         * @example
         * const data = await PrayerData('Jakarta', 'Jakarta Pusat').get();
         * if (data) {
         *   console.log(`Found ${data.length} days of prayer data`);
         * }
         */
        async get(): Promise<Imsakiyah[] | null> {
            console.log(`[${tags.System}] Fetching prayer data FROM CACHE for ${city}, ${province}`)
            const res: Imsakiyah[] | null = await db.get(`${province}.${city}`)

            if (!res) {
                const data = await SholatKuService.fetchPrayerData({ province: originalProvince, city: originalCity })

                if (data.length === 0 || !data || typeof data === "undefined") {
                    return null
                }

                await SholatKuService.Database.PrayerData(province, city).set(data)
                return data
            }

            return res
        },

        /**
         * Stores prayer time data in the cache for the specified location.
         * This method overwrites any existing cached data for this location.
         * 
         * @async
         * @param {Imsakiyah[]} data - An array of Imsakiyah objects containing prayer times
         *   for multiple days. Each object should contain prayer time information for a single day.
         * @returns {Promise<void>} A promise that resolves when the data has been successfully cached
         * 
         * @throws May throw database-related errors during cache write operations
         * 
         * @example
         * const prayerTimes = [{ date: '2026-02-15', ... }, { date: '2026-02-16', ... }];
         * await PrayerData('Jakarta', 'Jakarta Pusat').set(prayerTimes);
         */
        async set(data: Imsakiyah[]): Promise<void> {
            await db.set(`${province}.${city}`, data)
        }
    }

    return chain
}