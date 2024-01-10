"use client";

import type { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { api } from "@barely/api/react";
import { useZodForm } from "@barely/lib/hooks/use-zod-form";
import { insertUserSchema } from "@barely/server/user.schema";
import { Text } from "@barely/ui/elements/typography";
import { Form, SubmitButton } from "@barely/ui/forms";
import { TextField } from "@barely/ui/forms/text-field";

import { LoginLinkSent } from "../login-success";

const signInSchema = insertUserSchema.pick({ email: true });

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
  callbackUrl?: string;
}

const LoginForm = ({ callbackUrl }: RegisterFormProps) => {
  const form = useZodForm({
    schema: signInSchema,
    defaultValues: {
      email: "",
    },
  });

  const [loginEmailSent, setLoginEmailSent] = useState(false);

  const { mutateAsync: sendLoginEmail } = api.auth.sendLoginEmail.useMutation({
    onSuccess: () => {
      setLoginEmailSent(true);
    },
  });

  const onSubmit = async (user: z.infer<typeof signInSchema>) => {
    console.log("user => ", user);
    await sendLoginEmail({ email: user.email, callbackUrl });
    return;
  };

  return (
    <>
      {loginEmailSent ? (
        <LoginLinkSent identifier={form.watch("email")} provider="email" />
      ) : (
        <Form form={form} onSubmit={onSubmit}>
          <Text variant="sm/normal" subtle>
            Enter your email address
          </Text>

          <TextField
            type="email"
            autoCorrect="off"
            autoComplete="email"
            autoCapitalize="off"
            name="email"
            control={form.control}
            placeholder="name@example.com"
          />

          <SubmitButton fullWidth>Login with email 🚀</SubmitButton>
          <Text variant={"sm/normal"} subtle underline>
            <Link href="/register" className="hover:text-brand">
              {`Don't have an account? Sign Up`}
            </Link>
          </Text>
        </Form>
      )}
    </>
  );
};

export default LoginForm;
