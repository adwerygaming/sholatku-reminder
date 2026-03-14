import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { DiscordPartialGuild } from "../../shared/types/Discord.types"

interface GuildCardProps {
    guild: DiscordPartialGuild
}

export default function GuildCard({ guild: g }: GuildCardProps) {
    return (
        <Card>
            <CardContent>
                <div className="flex flex-row items-center justify-between gap-2">
                    <div>
                        {g.icon ? (
                            <Image
                                src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`}
                                alt={g.name}
                                width={32}
                                height={32}
                                className="rounded"
                                unoptimized
                            />
                        ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">
                                {g.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.id}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
