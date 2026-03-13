"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { APIService } from "@/lib/APIService"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { DiscordChannelRequestResponse } from "sholatku-reminder-shared/types/RPC.types.js"
import { DiscordPartialGuild } from "../../../shared/types/Discord.types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SelectGuildChannelSectionProps {
    selectedGuild: DiscordPartialGuild | null
    onChannelChange: (value: DiscordChannelRequestResponse | null) => void
}

interface SelectGuildChannelForm {
    channelId: string
}

const api = new APIService()

export default function SelectGuildChannelSection({ selectedGuild, onChannelChange }: SelectGuildChannelSectionProps) {
    const { control, handleSubmit, reset } = useForm<SelectGuildChannelForm>({
        defaultValues: {
            channelId: "",
        },
    })
    const [channels, setChannels] = useState<DiscordChannelRequestResponse[]>([])
    const [channelsLoading, setChannelsLoading] = useState(false)
    const [selectedChannelId, setSelectedChannelId] = useState("")

    useEffect(() => {
        (async () => {
            setChannels([])
            setSelectedChannelId("")
            reset({ channelId: "" })

            if (selectedGuild) {
                setChannelsLoading(true)
                const channels = await api.fetchDiscordGuildChannels(selectedGuild.id)
                setChannels(channels)
                setChannelsLoading(false)
            }
        })()
    }, [reset, selectedGuild])

    function onSubmit(data: SelectGuildChannelForm) {
        const channel = channels.find((c) => c.id === data.channelId) ?? null
        onChannelChange(channel)
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-row items-center justify-between">
                <p className="font-semibold">{channels.length} Available channels to choose from.</p>
                {channelsLoading && <p>Loading channels...</p>}
            </div>

            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-3">
                        <Controller
                            name="channelId"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <ScrollArea className="h-72">
                                    <RadioGroup
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            setSelectedChannelId(value)
                                        }}
                                    >
                                        {channels.map((channel) => (
                                            <FieldLabel htmlFor={channel.id} key={channel.id} className="w-full">
                                                <Field orientation="horizontal">
                                                    <FieldContent>
                                                        <FieldTitle>{channel.name || "Unnamed channel"}</FieldTitle>
                                                        <FieldDescription>
                                                            {channel.id}
                                                        </FieldDescription>
                                                    </FieldContent>
                                                    <RadioGroupItem value={channel.id} id={channel.id} />
                                                </Field>
                                            </FieldLabel>
                                        ))}
                                    </RadioGroup>
                                </ScrollArea>
                            )}
                        />

                        <Button type="submit" disabled={!selectedChannelId || channelsLoading || !selectedGuild}>
                            Confirm
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}