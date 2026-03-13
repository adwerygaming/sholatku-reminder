"use client"

import GuildCard from "@/components/GuildCard"
import { APIService } from "@/lib/APIService"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { DiscordPartialGuild } from "../../../shared/types/Discord.types"

const api = new APIService()

interface SelectGuildSectionProps {
    onGuildChange?: (value: DiscordPartialGuild | null) => void
}

export default function SelectGuildSection({ onGuildChange }: SelectGuildSectionProps) {
    const { data: session } = authClient.useSession()
    const [guilds, setGuilds] = useState<DiscordPartialGuild[]>()
    const [guildsLoading, setGuildsLoading] = useState(false)

    useEffect(() => {
        if (!session) return;
        
        (async () => {
            setGuildsLoading(true)
            const guilds = await api.getGuilds()
            setGuilds(guilds)
            setGuildsLoading(false)
        })()
    }, [session])

    return (
        <div className="space-y-2">
            <div className="flex flex-row items-center justify-between">
                <p className="font-semibold">{guilds?.length} Available servers to choose from.</p>
                {guildsLoading && <p>Loading guilds...</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {guilds?.map((g) => (
                    <GuildCard key={g.id} guild={g} />
                ))}
            </div>
        </div>
    )
}
