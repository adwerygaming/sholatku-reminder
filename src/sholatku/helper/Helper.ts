import moment from "moment-timezone"

/**
 * #### Converting user input into database key string.
 * ---
 * Use this for inserting into database as a key.
 * @param input A string that looks like this. 
 * @returns ABC, 0-9 Only strings, That_Look_Like_This. 
 */
function normalizeInput(input: string): string {
    return input.replace(/[^a-zA-Z0-9]/g, "_")
}

/**
 * #### Converting time string like "18:30" into Moment object of today with that time.
 * @param time string Hour:Minute time format
 * @returns Moment object of that time for today.
 */
function convertTimeToMoment(time: string): moment.Moment {
    const obj = moment(time, "HH:mm")
    return obj
}

/**
 * #### Converting database key into normal string. 
 * ---
 * Use this for displaying to user from database key.
 * @param input A_string_that_looks_like_this. 
 * @returns A string that looks like this. For displaying to user.
 */
function normalizeOutput(input: string): string {
    return input.replace(/_/g, ' ')
}

/**
 * #### Turns input into slugified string. thatlooklikethis
 * @param input 
 * @returns 
 */
function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[.\s_]+/g, '')
}

/**
 * #### Capitalize each word in the input string. 
 * @param input input that looks like this.
 * @returns Each word capitalzed string, Input That Looks Like This
 */
function capitalizeWords(input: string): string {
    return input
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export { capitalizeWords, convertTimeToMoment, normalizeInput, normalizeOutput, slugify }
