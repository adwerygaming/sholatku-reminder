export interface BasePayload {
    /** The call back channel id */
    replyTo: string
}

export interface DiscordChannelRequestProp extends BasePayload {
    guildId: string
}

export interface DiscordChannelRequestResponse {
    id: string
    name: string
}