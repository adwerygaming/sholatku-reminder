import moment from "moment-timezone"

function normalizeInput(input: string): string {
    return input.replace(/[^a-zA-Z0-9]/g, "_")
}

function convertTimeToMoment(time: string) {
    const obj = moment(time, "HH:mm")
    return obj
}

function normalizeOutput(input: string): string {
    return input.replace(/_/g, ' ')
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .replace(/[.\s_]+/g, '')
}

function capitalizeWords(input: string) {
    return input
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export default { capitalizeWords, normalizeInput, normalizeOutput, convertTimeToMoment, slugify }