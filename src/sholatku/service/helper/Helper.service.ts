import moment from "moment-timezone"

const SholatKuServiceHelper = {
    normalizeInput(input: string): string {
        return input.replace(/[^a-zA-Z0-9]/g, "_")
    },

    convertTimeToMoment(time: string) {
        const obj = moment(time, "HH:mm")
        return obj
    },
    
    normalizeOutput(input: string): string {
        return input.replace(/_/g, ' ')
    },

    slugify(input: string) {
        return input
            .toLowerCase()
            .replace(/[.\s_]+/g, '')
    },

    capitalizeWords(input: string) {
        return input
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }
}

export default SholatKuServiceHelper