"use client"

import { Overlay } from "@/components/Overlay";
import { authClient } from "@/lib/auth-client";
import NiceModal from "@ebay/nice-modal-react";
import { useEffect } from "react";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { data: session, isPending } = authClient.useSession()
    
    useEffect(() => {
        if (!isPending && !session) {
            window.location.href = "/login"
        }
    }, [session, isPending])

    if (isPending) {
        return <Overlay message="Loading..." />
    }

    return (
        <NiceModal.Provider>
            <div>
                {children}
            </div>
        </NiceModal.Provider>
    );
}