import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function LogOutBtn() {
    async function logout() {
        await authClient.signOut()
    }

    return (
        <Button onClick={() => logout()}>
            Logout
        </Button>
    )
}