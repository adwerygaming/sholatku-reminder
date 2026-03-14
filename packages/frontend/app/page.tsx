"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Sholatku Web UI</h1>

        {(session && !isPending) ? (
          <div className="flex flex-row gap-2">
            <h1>Hello {session.user.name}</h1>
            <Link href={"/dashboard"}>
              Go to dashboard
            </Link>
          </div>
        ) : (
          <>
            {isPending ? (
              <p>Loading...</p>
            ) : (
              <Link href={"/login"}>
                Click here to login
              </Link>
            )}
          </>
        )}
      </div>
    </>
  );
}
