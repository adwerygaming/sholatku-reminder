// placeholder for whatsapp user, replace with user from baileys later
export interface WhatsAppUser {
    phoneNumber: string
    displayName: string
}

export interface DatabaseRawSchema<D> {
    id: string
    value: D
}