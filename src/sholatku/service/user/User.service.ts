import { User as DiscordUser } from "discord.js"
import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"
import { Location, SholatkuDiscordUser, SholatkuUser, SholatkuUserProvider } from "../../../types/SholatKu.types.js"
import SholatKuServiceHelper from "../helper/Helper.service.js"
import UserPrayerState from "./UserPrayerState.service.js"

interface UserNoId {
    getByLocation(location: Location): Promise<SholatkuUser | undefined>
    getAll(): Promise<SholatkuUser[]>
    ResolveUser(user: DiscordUser): Promise<Omit<SholatkuDiscordUser, "location" | "lastUpdatedAt">>
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
        let userId = null

        if (user.provider == SholatkuUserProvider.Discord) {
            userId = `discord-${user.id}`
        } else if (user.provider == SholatkuUserProvider.WhatsApp) {
            // TODO: Take a look at the phone number formatting, if the formatting include @c.us or not
            // TODO: Make a func that seperate the @ and . from the phone number formatting (ex: 62812341111@c.us)
            userId = `whatsapp-${user.phoneNumber}`
        }

        if (!userId) {
            throw new Error("Invalid user provider")
        }

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
        async getByLocation({ city, province }: Location): Promise<SholatkuUser | undefined> {
            const usersRaw = await db.all<SholatkuUser>()

            const user = usersRaw.find(x =>
                x.value.location.city === city &&
                x.value.location.province === province
            )

            return user?.value
        },
        async getAll(): Promise<SholatkuUser[]> {
            const usersRaw = await db.all<SholatkuUser>()

            const users = usersRaw.map((x) => {
                return { id: x.id, ...x.value }
            })

            return users
        },
        async ResolveUser(user: DiscordUser) {
            // TODO: Add Whatsapp user later

            const userId = `discord-${user.id}`

            const resolved: Omit<SholatkuDiscordUser, "location" | "lastUpdatedAt"> = {
                id: userId,
                discordId: user.id,
                provider: SholatkuUserProvider.Discord,
                username: user.username,
                displayName: user.displayName
            }

            return resolved
        }
    }
}