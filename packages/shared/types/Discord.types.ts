/**
 * Guild features as defined by Discord API.
 * @see https://docs.discord.com/developers/resources/guild#guild-object-guild-features
 */
export type DiscordGuildFeature =
    | 'ANIMATED_BANNER'
    | 'ANIMATED_ICON'
    | 'APPLICATION_COMMAND_PERMISSIONS_V2'
    | 'AUTO_MODERATION'
    | 'BANNER'
    | 'COMMUNITY'
    | 'CREATOR_MONETIZABLE_PROVISIONAL'
    | 'CREATOR_STORE_PAGE'
    | 'DEVELOPER_SUPPORT_SERVER'
    | 'DISCOVERABLE'
    | 'FEATURABLE'
    | 'INVITES_DISABLED'
    | 'INVITE_SPLASH'
    | 'MEMBER_VERIFICATION_GATE_ENABLED'
    | 'MORE_STICKERS'
    | 'NEWS'
    | 'PARTNERED'
    | 'PREVIEW_ENABLED'
    | 'RAID_ALERTS_DISABLED'
    | 'ROLE_ICONS'
    | 'ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE'
    | 'ROLE_SUBSCRIPTIONS_ENABLED'
    | 'TICKETED_EVENTS_ENABLED'
    | 'VANITY_URL'
    | 'VERIFIED'
    | 'VIP_REGIONS'
    | 'WELCOME_SCREEN_ENABLED'
    | (string & {}); // allow unknown future features without breaking

/**
 * Partial guild object returned by GET /users/@me/guilds.
 * `approximate_member_count` and `approximate_presence_count` are only
 * present when the request is made with `?with_counts=true`.
 * @see https://docs.discord.com/developers/resources/user#get-current-user-guilds
 */
export interface DiscordPartialGuild {
    /** Guild snowflake ID */
    id: string;
    /** Guild name (2–100 characters) */
    name: string;
    /** Icon hash, or null if no icon */
    icon: string | null;
    /** Banner hash, or null if no banner */
    banner: string | null;
    /** Whether the current user is the owner */
    owner: boolean;
    /** Total permissions bitfield string for the current user in the guild */
    permissions: string;
    /** Enabled guild features */
    features: DiscordGuildFeature[];
    /** Approximate number of members — only with `?with_counts=true` */
    approximate_member_count?: number;
    /** Approximate number of online members — only with `?with_counts=true` */
    approximate_presence_count?: number;
}
