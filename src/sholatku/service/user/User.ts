import moment from "moment-timezone"
import DatabaseClient from "../../../database/DatabaseClient.js"
import { AllUsersInfo, Location, UserInfo } from "../SholatKu.js"
import UserPrayerState from "./UserPrayerState.js"

interface UserNoId {
    getByLocation(location: Location): Promise<UserInfo | undefined>
    getAll(): Promise<AllUsersInfo[]>
}

interface UserWithId {
    PrayerState: ReturnType<typeof UserPrayerState>
    register(province: string, city: string): Promise<UserInfo>
    unregister(): Promise<void>
    getInfo(): Promise<UserInfo | null>
    updateInfo(province: string, city: string): Promise<UserInfo>
    isRegistered(): Promise<boolean>
}

export function SholatKuServiceUser(userId: string): UserWithId
export function SholatKuServiceUser(): UserNoId

export function SholatKuServiceUser(userId?: string) {
    const db = DatabaseClient.table("users")

    if (userId) {
        return {
            PrayerState: UserPrayerState(userId),

            async register(province: string, city: string): Promise<UserInfo> {
                const obj: UserInfo = {
                    createdAt: moment().toISOString(),
                    province,
                    city
                }

                await db.set(`${userId}`, obj)
                return obj
            },

            async unregister(): Promise<void> {
                await db.delete(`${userId}`)
            },

            async getInfo(): Promise<UserInfo | null> {
                return await db.get(`${userId}`)
            },

            async updateInfo(province: string, city: string): Promise<UserInfo> {
                return this.register(province, city)
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