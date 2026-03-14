"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import NiceModal from "@ebay/nice-modal-react";

export default NiceModal.create(() => {
    const modal = NiceModal.useModal();
    return (
        <Dialog open={modal.visible} onOpenChange={(open) => {
            if (!open) modal.hide();
        }}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
})