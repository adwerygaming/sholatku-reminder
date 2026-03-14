"use client";

import { ProviderSelection } from "@/app/dashboard/page";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { APIService } from "@/lib/APIService";
import NiceModal from "@ebay/nice-modal-react";
import { useState } from "react";
import { DiscordPartialGuild } from "sholatku-reminder-shared/types/Discord.types.js";
import { DiscordChannelRequestResponse } from "sholatku-reminder-shared/types/RPC.types.js";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";

const api = new APIService()

interface ConfirmSubscriptionModalProps {
    platform: ProviderSelection
    province: string,
    city: string,
    guild: DiscordPartialGuild,
    channel: DiscordChannelRequestResponse,
}

export default NiceModal.create(({ platform, province, city, guild, channel }: ConfirmSubscriptionModalProps) => {
    const modal = NiceModal.useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submit() {
        setIsSubmitting(true);

        const res = await api.subscribe({
            channelId: channel.id,
            guildId: guild.id,
            platform,
            province,
            city,
        })

        console.log("Subscription response:")
        console.log(res)

        if (res) {
            alert("Subscription created successfully!")
            modal.hide()
        } else {
            alert("Failed to create subscription. Please try again later.")
        }

        setIsSubmitting(false);
    }

    return (
        <Dialog open={modal.visible} onOpenChange={(open) => {
            if (!open) modal.hide();
        }}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Subscription Confirmation</DialogTitle>
                    <DialogDescription>
                        <b>Please check data below before confirming your subscription.</b> Make sure the selected information is correct, if not please go back and change it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Item className="flex" variant={"muted"}>
                        <ItemContent className="flex-1">
                            <ItemTitle>Platform</ItemTitle>
                        </ItemContent>

                        <ItemContent>
                            <ItemDescription>{platform ?? "Unknown"}</ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item className="flex" variant={"muted"}>
                        <ItemContent className="flex-1">
                            <ItemTitle>Province</ItemTitle>
                        </ItemContent>

                        <ItemContent>
                            <ItemDescription>{province ?? "Unknown"}</ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item className="flex" variant={"muted"}>
                        <ItemContent className="flex-1">
                            <ItemTitle>City</ItemTitle>
                        </ItemContent>

                        <ItemContent>
                            <ItemDescription>{city ?? "Unknown"}</ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item className="flex" variant={"muted"}>
                        <ItemContent className="flex-1">
                            <ItemTitle>Guild</ItemTitle>
                        </ItemContent>

                        <ItemContent>
                            <ItemDescription>{guild?.name ?? "Unknown"}</ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item className="flex" variant={"muted"}>
                        <ItemContent className="flex-1">
                            <ItemTitle>Channel</ItemTitle>
                        </ItemContent>

                        <ItemContent>
                            <ItemDescription>{channel?.name ?? "Unknown"}</ItemDescription>
                        </ItemContent>
                    </Item>
                </div>

                <ButtonGroup className="w-full gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1">Go back</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting} className="flex-1" onClick={() => submit()}>
                        {isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                </ButtonGroup>
            </DialogContent>
        </Dialog>
    )
})