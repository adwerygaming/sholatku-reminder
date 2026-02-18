import { User } from "discord.js"
import moment from "moment-timezone"
import { v4 as uuidv4 } from 'uuid'
import DatabaseClient from "../../../database/DatabaseClient.js"
import { Location, SholatkuUser, UserProvider, WhatsAppUser } from "../../../types/SholatKu.types.js"
import SholatKuServiceHelper from "../helper/Helper.service.js"

export type SholatkuUnionUser = {
    provider: UserProvider.Discord,
    user: User
} | {
    provider: UserProvider.WhatsApp,
    user: WhatsAppUser
}

// has user
export class UserAccount {
    constructor(
        private readonly user: SholatkuUser,
        private readonly db = DatabaseClient.table("users"),
        private readonly prayerStateDb = DatabaseClient.table("user_prayer_state")
    ) { }

    async getPrayerState(eventName: string): Promise<boolean> {
        const now = moment()
        const dayIdentifier = now.format("DD_MM")

        const res = await this.prayerStateDb.get(`${this.user.id}.${dayIdentifier}.${eventName}`)

        return res ? true : false
    }

    async setPrayerState(eventName: string, value: boolean): Promise<void> {
        const now = moment()
        const dayIdentifier = now.format("DD_MM")
        await this.prayerStateDb.set(`${this.user.id}.${dayIdentifier}.${eventName}`, value)
    }

    // =======

    async getProvince(): Promise<string | null> {
        const res = await this.db.get<string>(`${this.user.id}.location.province`)
        return res || null
    }

    async setProvince(province: string): Promise<void> {
        province = SholatKuServiceHelper.normalizeInput(province)

        await this.db.set(`${this.user.id}.location.province`, province)
        await this.db.set(`${this.user.id}.location.lastUpdatedAt`, moment().toISOString())
    }

    async getCity(): Promise<string | null> {
        const res = await this.db.get<string>(`${this.user.id}.location.city`)
        return res || null
    }

    async setCity(city: string): Promise<void> {
        city = SholatKuServiceHelper.normalizeInput(city)

        await this.db.set(`${this.user.id}.location.city`, city)
        await this.db.set(`${this.user.id}.location.lastUpdatedAt`, moment().toISOString())
    }

    async unregister(): Promise<void> {
        await this.db.delete(`${this.user.id}.location`)
    }

    async fetch(): Promise<SholatkuUser | null> {
        const user = await this.db.get<SholatkuUser>(`${this.user.id}`)
        return user
    }

    async isRegistered(): Promise<boolean> {
        const user = await this.db.get<SholatkuUser>(`${this.user.id}`)
        return user?.location ? true : false
    }
}

// has no user
export class UserManager {
    constructor(
        private readonly db = DatabaseClient.table<SholatkuUser>("users")
    ) {}
    
    async register(user: SholatkuUser, location: Location): Promise<SholatkuUser> {
        const obj: SholatkuUser = {
            ...user,
            location: {
                ...location,
                lastUpdatedAt: moment().toISOString()
            }
        }

        await this.db.set(user.id, obj)

        return obj
    }

    async getByLocation({ city, province }: Location): Promise<SholatkuUser[] | undefined> {
        const usersRaw = await this.getAll()

        const user = usersRaw.filter(x =>
            x.location?.city === city &&
            x.location?.province === province
        )

        return user
    }

    async getAll(): Promise<SholatkuUser[]> {
        const usersRaw = await this.db.all<SholatkuUser>()

        const users: SholatkuUser[] = usersRaw.map((x) => {
            return { ...x.value }
        })

        return users
    }

    async resolve(user: SholatkuUnionUser): Promise<SholatkuUser> {
        const SholatkuUserId = uuidv4()

        let obj: SholatkuUser | null = null

        if (user.provider == UserProvider.Discord) {
            const check = await this.getAll()

            const discordUsers = await check.filter((x) => x.provider === UserProvider.Discord)
            const exist = discordUsers.filter((x) => x.discordId == user.user.id)?.[0]

            if (exist) {
                return exist
            }

            obj = {
                id: SholatkuUserId,
                discordId: user.user.id,
                displayName: user.user.displayName,
                provider: UserProvider.Discord,
                username: user.user.username,
            }
        } else if (user.provider == UserProvider.WhatsApp) {
            const check = await this.getAll()

            const discordUsers = await check.filter((x) => x.provider === UserProvider.WhatsApp)
            const exist = discordUsers.filter((x) => x.phoneNumber == user.user.phoneNumber)?.[0]

            if (exist) {
                return exist
            }

            obj = {
                id: SholatkuUserId,
                provider: UserProvider.WhatsApp,
                displayName: user.user.displayName,
                phoneNumber: user.user.phoneNumber
            }
        }

        await this.db.set(SholatkuUserId, obj)

        // source: trust me bro
        return obj!
    }
}