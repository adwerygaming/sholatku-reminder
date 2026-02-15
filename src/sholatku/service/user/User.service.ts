import { User } from "discord.js"
import moment from "moment-timezone"
import { v4 as uuidv4 } from 'uuid'
import DatabaseClient from "../../../database/DatabaseClient.js"
import { Location, SholatkuUser, SholatkuUserProvider, WhatsAppUser } from "../../../types/SholatKu.types.js"
import SholatKuServiceHelper from "../helper/Helper.service.js"
import UserPrayerState from "./UserPrayerState.service.js"

export type SholatkuUnionUser = {
    provider: SholatkuUserProvider.Discord,
    user: User
} | {
    provider: SholatkuUserProvider.WhatsApp,
    user: WhatsAppUser
}

interface UserNoId {
    register(user: SholatkuUser, location: Location): Promise<SholatkuUser>
    getByLocation(location: Location): Promise<SholatkuUser[] | undefined>
    getAll(): Promise<SholatkuUser[]>
    resolveUser(u: SholatkuUnionUser): Promise<SholatkuUser>
}

interface UserWithId {
    PrayerState: ReturnType<typeof UserPrayerState>
    Province: {
        get(): Promise<string | null>
        set(value: string): Promise<void>
    }
    City: {
        get(): Promise<string | null>
        set(value: string): Promise<void>
    }
    unregister(): Promise<void>
    get(): Promise<SholatkuUser | null>
    isRegistered(): Promise<boolean>
}

export function SholatKuServiceUser(user: SholatkuUser): UserWithId
export function SholatKuServiceUser(): UserNoId

/**
 * Service for managing SholatkuUser.
 * @param user SholatkuUser object.
 * @returns Bunch of functions.
 */
export function SholatKuServiceUser(user?: SholatkuUser) {
    const db = DatabaseClient.table("users")

    if (user) {
        const userId = user.id

        return {
            PrayerState: UserPrayerState(userId),

            Province: {
                /**
                 * Fetch only the province of the user. If the user or province not found, return null.
                 * @returns Province in database key format (with underscore, e.g. "DKI_Jakarta"). If not found, return null.
                 */
                async get(): Promise<string | null> {
                    const res = await db.get<string>(`${userId}.location.province`)
                    return res || null
                },

                /**
                 * Set or update only the province of the user.
                 * @param value Province name in any format (e.g. "DKI Jakarta", "DKI_Jakarta"). The function will normalize the input and store it in database key format (with underscore, e.g. "DKI_Jakarta").
                 */
                async set(value: string): Promise<void> {
                    value = SholatKuServiceHelper.normalizeInput(value)

                    await db.set(`${userId}.location.province`, value)
                    await db.set(`${userId}.location.lastUpdatedAt`, moment().toISOString())
                }
            },

            City: {
                /**
                 * Fetch only the city of the user. If the user or city not found, return null.
                 * @returns City in database key format (with underscore, e.g. "Kota_Jakarta"). If not found, return null.
                 */
                async get(): Promise<string | null> {
                    const res = await db.get<string>(`${userId}.location.city`)
                    return res || null
                },

                /**
                 * Set or update only the city of the user.
                 * @param value City name in any format (e.g. "Kota Jakarta", "Kota_Jakarta"). The function will normalize the input and store it in database key format (with underscore, e.g. "Kota_Jakarta").
                 */
                async set(value: string): Promise<void> {
                    value = SholatKuServiceHelper.normalizeInput(value)

                    await db.set(`${userId}.location.city`, value)
                    await db.set(`${userId}.location.lastUpdatedAt`, moment().toISOString())
                }
            },

            /**
             * Delete the user from database.
             */
            async unregister(): Promise<void> {
                await db.delete(`${userId}`)
            },

            /**
             * Get the user object from database. If the user not found, return null.
             * @returns SholatkuUser object if found, or null if not found.
             */
            async get(): Promise<SholatkuUser | null> {
                return await db.get<SholatkuUser>(`${userId}`)
            },

            /**
             * Quick check if the user is registered or not.
             * @returns boolean. True if the user is registered, false if not.
             */
            async isRegistered(): Promise<boolean> {
                return !!(await db.get<SholatkuUser>(`${userId}`))
            }
        }
    }

    return {
        /**
         * Register in context of location. Resolve the user first using the resolveUser().
         * @param user SholatkuUser object
         * @param location LOcation object, containing province and city.
         * @returns SholatkuUser object that has location property.
         */
        async register(user: SholatkuUser, location: Location): Promise<SholatkuUser> {
            const userId = user.id

            const obj: SholatkuUser = {
                ...user,
                location: {
                    ...location,
                    lastUpdatedAt: moment().toISOString()
                }
            }

            await db.set(userId, obj)

            return obj
        },
        /**
         * Find multiple SholatkuUser by their location (province & city).
         * @param location Location object, containing province and city. 
         * @returns Array of SholatkuUser that has location property that matches the parameter. If no user found, return empty array.
         */
        async getByLocation({ city, province }: Location): Promise<SholatkuUser[] | undefined> {
            const usersRaw = await this.getAll()

            const user = usersRaw.filter(x =>
                x.location?.city === city &&
                x.location?.province === province
            )

            return user
        },
        /**
         * Get all registered SholatkuUser from database.
         * @returns Array of SholatkuUser objects.
         */
        async getAll(): Promise<SholatkuUser[]> {
            const usersRaw = await db.all<SholatkuUser>()

            const users: SholatkuUser[] = usersRaw.map((x) => {
                return { ...x.value }
            })

            return users
        },

        /**
         * Resolve user object from various platform, such as Discord & Whatsapp. Turning into SholatkuUser object. If the user already exist in database, it will return the existing user. If not, create new SholatkuUser in database and return it.
         * @param u Provider type & that platform user object.
         * @returns Sholatku user object (without location property, use register() to register with locations
         */
        async resolveUser(u: SholatkuUnionUser): Promise<SholatkuUser> {
            const SholatkuUserId = uuidv4()

            let obj: SholatkuUser | null = null

            if (u.provider == SholatkuUserProvider.Discord) {
                const check = await this.getAll()

                const discordUsers = await check.filter((x) => x.provider === SholatkuUserProvider.Discord)
                const exist = discordUsers.filter((x) => x.discordId == u.user.id)?.[0]

                if (exist) {
                    return exist
                }

                obj = {
                    id: SholatkuUserId,
                    discordId: u.user.id,
                    displayName: u.user.displayName,
                    provider: SholatkuUserProvider.Discord,
                    username: u.user.username,
                }
            } else if (u.provider == SholatkuUserProvider.WhatsApp) {
                const check = await this.getAll()

                const discordUsers = await check.filter((x) => x.provider === SholatkuUserProvider.WhatsApp)
                const exist = discordUsers.filter((x) => x.phoneNumber == u.user.phoneNumber)?.[0]

                if (exist) {
                    return exist
                }

                obj = {
                    id: SholatkuUserId,
                    provider: SholatkuUserProvider.WhatsApp,
                    displayName: u.user.displayName,
                    phoneNumber: u.user.phoneNumber
                }
            }
             
            await db.set(SholatkuUserId, obj)

            // source: trust me bro
            return obj!
        }
    }
}