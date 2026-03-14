"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { register, handleSubmit } = useForm<LoginFormData>()

  const onSubmit = (data: LoginFormData) => {
    console.log(data)
  }

  const handleDiscordLogin = async () => {
    const callbackURL = `${window.location.origin}/`
    await authClient.signIn.social({
      provider: "discord",
      callbackURL,
    })
  }

  const handleGoogleLogin = async () => {
    const callbackURL = `${window.location.origin}/`
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    })
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required 
                  {...register("password")}
                />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>

                <Separator className="my-2"/>

                <Button variant="outline" type="button" onClick={handleDiscordLogin}>
                  Login with Discord
                </Button>
                <Button variant="outline" type="button" onClick={handleGoogleLogin}>
                  Login with Google
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
