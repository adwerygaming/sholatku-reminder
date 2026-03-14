interface OverlayProps {
    message?: string
}

export function Overlay({ message }: OverlayProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <h1 className="font-semibold text-2xl">Sholatku Dashboard</h1>
            <p>{message}</p>
        </div>
    )
}