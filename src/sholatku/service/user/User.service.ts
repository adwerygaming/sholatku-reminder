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
    getByLocation(location: Location): Promise<SholatkuUser | undefined>
    getAll(): Promise<SholatkuUser[]>
    getUser(userId: string): Promise<SholatkuUser | null>
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
    getInfo(): Promise<SholatkuUser | null>
    isRegistered(): Promise<boolean>
}

export function SholatKuServiceUser(user: SholatkuUser): UserWithId
export function SholatKuServiceUser(): UserNoId

export function SholatKuServiceUser(user?: SholatkuUser) {
    const db = DatabaseClient.table("users")

    if (user) {
        const userId = user.id

        return {
            PrayerState: UserPrayerState(userId),

            Province: {
                async get(): Promise<string | null> {
                    const res = await db.get<string>(`${userId}.location.province`)
                    return res || null
                },
                async set(value: string): Promise<void> {
                    value = SholatKuServiceHelper.normalizeInput(value)

                    await db.set(`${userId}.location.province`, value)
                    await db.set(`${userId}.location.lastUpdatedAt`, moment().toISOString())
                }
            },

            City: {
                async get(): Promise<string | null> {
                    const res = await db.get<string>(`${userId}.location.city`)
                    return res || null
                },
                async set(value: string): Promise<void> {
                    value = SholatKuServiceHelper.normalizeInput(value)

                    await db.set(`${userId}.location.city`, value)
                    await db.set(`${userId}.location.lastUpdatedAt`, moment().toISOString())
                }
            },

            async unregister(): Promise<void> {
                await db.delete(`${userId}`)
            },

            async getInfo(): Promise<SholatkuUser | null> {
                return await db.get<SholatkuUser>(`${userId}`)
            },

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
        async getByLocation({ city, province }: Location): Promise<SholatkuUser | undefined> {
            const usersRaw = await db.all<SholatkuUser>()

            const user = usersRaw.find(x =>
                x.value?.location?.city === city &&
                x.value?.location?.province === province
            )

            return user?.value
        },
        async getAll(): Promise<SholatkuUser[]> {
            const usersRaw = await db.all<SholatkuUser>()

            const users: SholatkuUser[] = usersRaw.map((x) => {
                return { ...x.value }
            })

            return users
        },

        /**
         * Get existing Sholatku User by id
         * @param userId Id for SholatkuUser.
         * @returns SholatkuUser object if found, null if not found.
         */
        async getUser(userId: string): Promise<SholatkuUser | null> {
            const res = await db.get<SholatkuUser>(userId)

            return res || null
        },

        /**
         * Resolve user object from various platform, such as Discord & Whatsapp. Turning into SHolatkuUser object.
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