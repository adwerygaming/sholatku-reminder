"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { APIService } from "@/lib/APIService"
import { CircleQuestionMarkIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { DiscordChannelRequestResponse } from "sholatku-reminder-shared/types/RPC.types.js"
import { DiscordPartialGuild } from "../../../shared/types/Discord.types"

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
    const [confirmedChannel, setConfirmedChannel] = useState<DiscordChannelRequestResponse | null>(null)

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
        setConfirmedChannel(channel)
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-row items-center justify-between">

                <div>
                    {channelsLoading ? (
                        <p>Loading channels...</p>
                    ) : (
                        <p className="font-semibold">{channels.length} Available channels to choose from.</p>
                    )}
                </div>

                <div>
                    {confirmedChannel && (
                        <span className="font-medium text-foreground">{confirmedChannel.name}</span>
                    )}
                </div>
            </div>

            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-5">
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

                        <div className="flex flex-row items-center justify-between">
                            <Button type="submit" disabled={!selectedChannelId || channelsLoading || !selectedGuild}>
                                Confirm
                            </Button>

                            <div className="flex flex-row-reverse items-center gap-2">
                                <CircleQuestionMarkIcon size={16}/>
                                <p className="text-foreground/70 text-sm text-right w-xs">Can&apos;t find the channel you&apos;re looking for? Make sure the bot has access to it.</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}