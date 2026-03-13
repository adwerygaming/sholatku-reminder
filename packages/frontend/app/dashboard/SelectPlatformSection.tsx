import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MouseEvent } from "react";
import { ProviderSelection } from "./page";

interface SelectPlatformSectionProps {
    onPlatformChange: (value: ProviderSelection) => void
}

export default function SelectPlatformSection({ onPlatformChange }: SelectPlatformSectionProps) {
    function handlePlatformSelection(v: MouseEvent<HTMLButtonElement, MouseEvent>) {
        const value: ProviderSelection = v?.currentTarget?.value as ProviderSelection
        onPlatformChange(value)
    }

    return (
        <div className="space-y-3">
            <h1 className="font-semibold">Select Platform</h1>

            <RadioGroup className="flex">
                <FieldLabel htmlFor="discord-provider">
                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldTitle>Discord</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="discord" id="discord-provider" onClick={(v) => handlePlatformSelection(v)} />
                    </Field>
                </FieldLabel>
                <FieldLabel htmlFor="whatsapp-provider">
                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldTitle>WhatsApp</FieldTitle>
                            <FieldDescription>Coming Soon</FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="whatsapp" id="whatsapp-provider" onClick={(v) => handlePlatformSelection(v)} />
                    </Field>
                </FieldLabel>
            </RadioGroup>
        </div>
    )
}