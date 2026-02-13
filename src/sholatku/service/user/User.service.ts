import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"
import SholatKuServiceHelper from "../helper/Helper.service.js"
import { AllUsersInfo, Location, UserInfo } from "../SholatKu.service.js"
import UserPrayerState from "./UserPrayerState.service.js"

interface UserNoId {
    getByLocation(location: Location): Promise<UserInfo | undefined>
    getAll(): Promise<AllUsersInfo[]>
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
    getInfo(): Promise<UserInfo | null>
    isRegistered(): Promise<boolean>
}

export function SholatKuServiceUser(userId: string): UserWithId
export function SholatKuServiceUser(): UserNoId

export function SholatKuServiceUser(userId?: string) {
    const db = DatabaseClient.table("users")

    if (userId) {
        return {
            PrayerState: UserPrayerState(userId),

            Province: {
                async get(): Promise<string | null> {
                    const res = await db.get<string>(`${userId}.province`)
                    return res || null
                },
                async set(value: string): Promise<void> {
                    value = SholatKuServiceHelper.normalizeInput(value)

                    await db.set(`${userId}.province`, value)
                    await db.set(`${userId}.lastUpdatedAt`, moment().toISOString())
                }
            },

            City: {
                async get(): Promise<string | null> {
                    const res = await db.get<string>(`${userId}.city`)
                    return res || null
                },
                async set(value: string): Promise<void> {
                    value = SholatKuServiceHelper.normalizeInput(value)

                    await db.set(`${userId}.city`, value)
                    await db.set(`${userId}.lastUpdatedAt`, moment().toISOString())
                }
            },

            async unregister(): Promise<void> {
                await db.delete(`${userId}`)
            },

            async getInfo(): Promise<UserInfo | null> {
                return await db.get(`${userId}`)
            },

            async isRegistered(): Promise<boolean> {
                return !!(await db.get(`${userId}`))
            }
        }
    }

    return {
        async getByLocation({ city, province }: Location): Promise<UserInfo | undefined> {
            const usersRaw = await db.all()

            const user = usersRaw.find(x =>
                x.value.city === city &&
                x.value.province === province
            )

            return user?.value
        },
        async getAll(): Promise<AllUsersInfo[]> {
            const usersRaw = await db.all()

            const users = usersRaw.map((x) => {
                return { id: x.id, ...x.value }
            })

            return users
        }
    }
}