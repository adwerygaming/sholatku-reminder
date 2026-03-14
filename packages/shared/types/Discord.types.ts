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

/**
 * Guild channel types returned by Discord API.
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export type DiscordChannelType =
    | 0 // GUILD_TEXT
    | 1 // DM
    | 2 // GUILD_VOICE
    | 3 // GROUP_DM
    | 4 // GUILD_CATEGORY
    | 5 // GUILD_ANNOUNCEMENT
    | 10 // ANNOUNCEMENT_THREAD
    | 11 // PUBLIC_THREAD
    | 12 // PRIVATE_THREAD
    | 13 // GUILD_STAGE_VOICE
    | 14 // GUILD_DIRECTORY
    | 15 // GUILD_FORUM
    | 16 // GUILD_MEDIA
    | (number & {});

/**
 * Overwrite object for a channel permission overwrite.
 * @see https://discord.com/developers/docs/resources/channel#overwrite-object
 */
export interface DiscordPermissionOverwrite {
    id: string;
    type: 0 | 1;
    allow: string;
    deny: string;
}

/**
 * Emoji object used by forum/media default reaction.
 */
export interface DiscordDefaultReactionEmoji {
    emoji_id: string | null;
    emoji_name: string | null;
}

/**
 * Forum/media tag object.
 */
export interface DiscordForumTag {
    id: string;
    name: string;
    moderated: boolean;
    emoji_id: string | null;
    emoji_name: string | null;
}

/**
 * Guild channel object returned by GET /guilds/{guild.id}/channels.
 * This shape includes common fields across text/voice/category/thread/forum/media channels.
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export interface DiscordGuildChannel {
    id: string;
    type: DiscordChannelType;
    guild_id: string;
    name: string;
    position: number;
    parent_id: string | null;
    permission_overwrites?: DiscordPermissionOverwrite[];
    topic?: string | null;
    nsfw?: boolean;
    last_message_id?: string | null;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    rtc_region?: string | null;
    video_quality_mode?: 1 | 2;
    default_auto_archive_duration?: 60 | 1440 | 4320 | 10080;
    permissions?: string;
    flags?: number;
    available_tags?: DiscordForumTag[];
    default_reaction_emoji?: DiscordDefaultReactionEmoji | null;
    default_thread_rate_limit_per_user?: number;
    default_sort_order?: 0 | 1 | null;
    default_forum_layout?: 0 | 1 | 2;
}
