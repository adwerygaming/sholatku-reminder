import moment from "moment-timezone"

const SholatKuServiceHelper = {
    normalize(input: string): string {
        return input.replace(/[^a-zA-Z0-9]/g, "_")
    },
    convertTimeToMoment(time: string) {
        const obj = moment(time, "HH:mm")
        return obj
    },
}

export default SholatKuServiceHelper