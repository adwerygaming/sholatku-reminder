"use client"

import NiceModal from "@ebay/nice-modal-react";

export default function TestModalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <NiceModal.Provider>
            {children}
        </NiceModal.Provider>
    )
}