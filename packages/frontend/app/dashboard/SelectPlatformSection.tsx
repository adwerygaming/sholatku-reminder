import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProviderSelection } from "./page";

interface SelectPlatformSectionProps {
    onPlatformChange: (value: ProviderSelection) => void
}

export default function SelectPlatformSection({ onPlatformChange }: SelectPlatformSectionProps) {
    function handlePlatformSelection(value: string) {
        const selectedPlatform: ProviderSelection = value as ProviderSelection
        onPlatformChange(selectedPlatform)
    }

    return (
        <div className="space-y-3">
            <h1 className="font-semibold">Select Platform</h1>

            <RadioGroup className="flex gap-4" onValueChange={handlePlatformSelection}>
                <FieldLabel htmlFor="discord-provider">
                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldTitle>Discord</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="discord" id="discord-provider" />
                    </Field>
                </FieldLabel>
                <FieldLabel htmlFor="whatsapp-provider">
                    <Field orientation="horizontal">
                        <FieldContent>
                            <FieldTitle>WhatsApp</FieldTitle>
                            <FieldDescription>Coming Soon</FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="whatsapp" id="whatsapp-provider" />
                    </Field>
                </FieldLabel>
            </RadioGroup>
        </div>
    )
}