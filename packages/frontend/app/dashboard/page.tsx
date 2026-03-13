"use client"

import LogOutBtn from "@/components/LogoutButton"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { LocationSearchResult } from "../../../shared/types/Location.types"
import SelectGuildSection from "./SelectGuildSection"
import SelectLocationSection from "./SelectLocationSection"
import SelectPlatformSection from "./SelectPlatformSection"

export type ProviderSelection = "discord" | "whatsapp"

export default function DashboardPage() {
    const { data: session } = authClient.useSession()

    const [providerSelection, setProviderSelection] = useState<ProviderSelection | null>(null)
    const [selectedCity, setSelectedCity] = useState<LocationSearchResult | null>(null)
    const [selectedProvince, setSelectedProvince] = useState<LocationSearchResult | null>(null)

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

                {selectedCity && selectedProvince && (
                    <SelectPlatformSection
                        onPlatformChange={(v) => setProviderSelection(v)}
                    />
                )}

                {providerSelection === "discord" && (
                    <SelectGuildSection /> 
                )}
            </div>
        </div>
    )
}