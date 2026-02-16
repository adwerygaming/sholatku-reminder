import moment from "moment-timezone"

const SholatKuServiceHelper = {
    /**
     * Normalizes a string by replacing all non-alphanumeric characters with underscores.
     * This is useful for creating safe identifiers or keys from user input strings.
     * 
     * @param input - The string to normalize
     * @returns The normalized string with non-alphanumeric characters replaced by underscores
     * @example
     * normalizeInput("Jakarta Pusat") // returns "Jakarta_Pusat"
     * normalizeInput("Kota-Baru 123") // returns "Kota_Baru_123"
     */
    normalizeInput(input: string): string {
        return input.replace(/[^a-zA-Z0-9]/g, "_")
    },

    /**
     * Converts a time string in HH:mm format to a moment object.
     * The resulting moment object will have today's date with the specified time.
     * 
     * @param time - The time string in "HH:mm" format (e.g., "13:45", "05:30")
     * @returns A moment object representing the specified time
     * @example
     * convertTimeToMoment("13:45") // returns moment object for 1:45 PM today
     * convertTimeToMoment("05:30") // returns moment object for 5:30 AM today
     */
    convertTimeToMoment(time: string) {
        const obj = moment(time, "HH:mm")
        return obj
    },

    /**
     * Denormalizes a string by replacing all underscores with spaces.
     * This reverses the normalization process, converting safe identifiers back to human-readable format.
     * 
     * @param input - The normalized string with underscores
     * @returns The denormalized string with underscores replaced by spaces
     * @example
     * normalizeOutput("Jakarta_Pusat") // returns "Jakarta Pusat"
     * normalizeOutput("Kota_Baru_123") // returns "Kota Baru 123"
     */
    normalizeOutput(input: string): string {
        return input.replace(/_/g, ' ')
    },

    slugify(str: string) {
        return str
            .toLowerCase()
            .replace(/[.\s_]+/g, '')
    }
}

export default SholatKuServiceHelper