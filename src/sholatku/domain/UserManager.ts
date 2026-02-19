import moment from "moment-timezone"
import { v4 as uuidv4 } from 'uuid'
import DatabaseClient from "../../database/DatabaseClient.js"
import { BaseLocation, Location } from "../../types/Location.types.js"
import { SholatkuUnionUser, SholatkuUser, UserProvider } from "../../types/Users.types.js"

// has no user
export class UserManager {
    constructor(
        private readonly db = DatabaseClient.table<SholatkuUser>("users")
    ) { }

    //! get locations from all users & remote duplicate, resulting in base location (province, city) list
    /**
     * Get all registered users's location (BaseLocation) then removing same locations across all users.
     * @returns Deduplicated array objects of BaseLocation
     */
    async getLocations(): Promise<BaseLocation[]> {
        const usersRaw = await this.db.all()

        const locations: BaseLocation[] = usersRaw.map((x) => {
            const location = x.value?.location
            if (!location) {
                return null
            }

            return { province: location.province, city: location.city }
        })
        .filter((x): x is BaseLocation => x !== null)
        .filter((v, i, a) => a.findIndex(t => (t.province === v.province && t.city === v.city)) === i)

        return locations
    }

    /**
     * Registering existing SholatkuUser with new Location data.
     * @param user SholatkuUser Object
     * @param location Location Object containing province & city
     * @returns Same SholatkuUser but with additional location data. how cool is that? 
     */
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

    /**
     * Get Sholatku users based on provided location param.
     * @param Location 
     * @returns Array of SholatkuUser[] that has Location matched to the param.
     */
    async getByLocation({ city, province }: Location): Promise<SholatkuUser[] | undefined> {
        const usersRaw = await this.getAll()

        const user = usersRaw.filter(x =>
            x.location?.city === city &&
            x.location?.province === province
        )

        return user
    }

    /**
     * 
     * @returns 
     */
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