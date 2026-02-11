import moment from "moment-timezone"
import DatabaseClient from "../database/DatabaseClient.js"

function User(id: string) {
    const now = moment()

    const dayIdentifier = now.format("dd_mm") // 11_03

    const chain = {
        async GetState(prayerName: string): Promise<boolean> {
            const res = await DatabaseClient.get(`${id}.state.${dayIdentifier}_${prayerName}`)

            return res ? true : false
        },
        async SetState(prayerName: string, value: boolean): Promise<void> {
            await DatabaseClient.set(`${id}.state.${dayIdentifier}_${prayerName}`, value)
        }
    }

    return chain
}

const SholatKuService = {
    User: User
}

export default SholatKuService