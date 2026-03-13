"use client"

import LogOutBtn from "@/components/LogoutButton"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { DiscordChannelRequestResponse } from "sholatku-reminder-shared/types/RPC.types.js"
import { DiscordPartialGuild } from "../../../shared/types/Discord.types"
import { LocationSearchResult } from "../../../shared/types/Location.types"
import SelectGuildChannelSection from "./SelectGuildChannelSection"
import SelectGuildSection from "./SelectGuildSection"
import SelectLocationSection from "./SelectLocationSection"
import SelectPlatformSection from "./SelectPlatformSection"

export type ProviderSelection = "discord" | "whatsapp"

export default function DashboardPage() {
    const { data: session } = authClient.useSession()

    const [providerSelection, setProviderSelection] = useState<ProviderSelection | null>(null)
    const [, setSelectedCity] = useState<LocationSearchResult | null>(null)
    const [, setSelectedProvince] = useState<LocationSearchResult | null>(null)
    const [selectedGuild, setSelectedGuild] = useState<DiscordPartialGuild | null>(null)
    const [selectedGuildChannel, setSelectedGuildChannel] = useState<DiscordChannelRequestResponse | null>(null)

    function handlePlatformSelection(v: ProviderSelection) {
        setProviderSelection(v)
        setSelectedGuild(null)
        setSelectedGuildChannel(null)
    }

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p>{session?.user.name}</p>
                    <p>{session?.user.id}</p>
                    <p>{session?.user.email}</p>
                    <LogOutBtn />
                </div>

                <SelectLocationSection
                    onProvinceChange={(v) => setSelectedProvince(v)}
                    onCityChange={(v) => setSelectedCity(v)}
                />

                {/* <p className="text-sm text-muted-foreground">
                    Selected:
                    <span className="font-medium text-foreground">{selectedProvince?.original}</span>,
                    <span className="font-medium text-foreground">{selectedCity?.original}</span>
                </p> */}

                <SelectPlatformSection
                    onPlatformChange={(v) => handlePlatformSelection(v)}
                />

                {providerSelection === "discord" && (
                    <>
                        <SelectGuildSection
                            onGuildChange={(v) => {
                                setSelectedGuild(v)
                                setSelectedGuildChannel(null)
                            }}
                        />

                        <p>
                            Selected Guild: <span className="font-medium text-foreground">{selectedGuild?.name}</span>
                        </p>

                        {selectedGuild && (
                            <SelectGuildChannelSection
                                selectedGuild={selectedGuild}
                                onChannelChange={(v) => setSelectedGuildChannel(v)}
                            />
                        )}

                        <p>
                            Selected Channel: <span className="font-medium text-foreground">{selectedGuildChannel?.name}</span>
                        </p>
                    </>
                )}
            </div>
        </div >
    )
}