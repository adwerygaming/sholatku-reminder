"use client";

import ConfirmSubscriptionModal from "@/components/modals/ConfirmSubscriptionModal";
import { Button } from "@/components/ui/button";
import NiceModal from "@ebay/nice-modal-react";

export default function TestModalPage() {
    function openModal() {
        NiceModal.show(ConfirmSubscriptionModal)
    }

    return (
        <div>
            <h1>Test Modal Page</h1>
            <Button onClick={() => openModal()}>
                Open Modal
            </Button>
        </div>
    )
}