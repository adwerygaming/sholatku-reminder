"use client"

import LogOutBtn from "@/components/logout-btn"
import { APIService } from "@/lib/APIService"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { DiscordPartialGuild } from "../../../shared/types/Discord.types"

interface OverlayProps {
    message?: string
}

const api = new APIService()

function Overlay({ message }: OverlayProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <h1>Sholatku Dashboard</h1>
            <p>{message}</p>
        </div>
    )
}

export default function DashboardPage() {
    const { data: session, isPending } = authClient.useSession()
    const [guilds, setGuilds] = useState<DiscordPartialGuild[]>()

    useEffect(() => {
        if (!isPending && !session) {
            window.location.href = "/login"
        }
    }, [session, isPending])

    useEffect(() => {
        if (!session) return

        (async () => {
            const guilds = await api.getGuilds()
            setGuilds(guilds)
        })()
    }, [session])

    if (isPending) {
        return Overlay({ message: "Loading..." })
    }

    return (
        <div className="p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p>{session?.user.name}</p>
                <p>{session?.user.id}</p>
                <p>{session?.user.email}</p>
                
                <LogOutBtn/>

                <p>You have {guilds?.length} guilds</p>
                {guilds?.map((g) => {
                    return (
                        <div key={g.id} className="p-4 border rounded">
                            <p>{g.name}</p>
                            <p>{g.id}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}