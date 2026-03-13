"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { APIService } from "@/lib/APIService"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { DiscordPartialGuild } from "../../../shared/types/Discord.types"

const api = new APIService()

interface SelectGuildSectionProps {
    onGuildChange: (value: DiscordPartialGuild | null) => void
}

interface SelectGuildForm {
    guildId: string
}

export default function SelectGuildSection({ onGuildChange }: SelectGuildSectionProps) {
    const { control, handleSubmit } = useForm<SelectGuildForm>({
        defaultValues: {
            guildId: "",
        },
    })
    const { data: session } = authClient.useSession()
    const [guilds, setGuilds] = useState<DiscordPartialGuild[]>()
    const [guildsLoading, setGuildsLoading] = useState(false)
    const [selectedGuildId, setSelectedGuildId] = useState("")

    useEffect(() => {
        if (!session) return;

        (async () => {
            setGuildsLoading(true)
            const guilds = await api.fetchDiscordGuilds()
            setGuilds(guilds)
            setGuildsLoading(false)
        })()
    }, [session])

    function onSubmit(data: SelectGuildForm) {
        const guild = guilds?.find((g) => g.id === data.guildId) ?? null
        onGuildChange(guild)
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-row items-center justify-between">
                <p className="font-semibold">{guilds?.length} Available servers to choose from.</p>
                {guildsLoading && <p>Loading guilds...</p>}
            </div>

            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-3">
                        <Controller
                            name="guildId"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <RadioGroup
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value)
                                        setSelectedGuildId(value)
                                    }}
                                >
                                    {guilds?.map((g) => (
                                        <FieldLabel htmlFor={g.id} key={g.id} className="w-full">
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle>{g.name}</FieldTitle>
                                                    <FieldDescription>
                                                        {g.id}
                                                    </FieldDescription>
                                                </FieldContent>
                                                <RadioGroupItem value={g.id} id={g.id} />
                                            </Field>
                                        </FieldLabel>
                                    ))}
                                </RadioGroup>
                            )}
                        />

                        <Button type="submit" disabled={!selectedGuildId || guildsLoading}>
                            Confirm
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
