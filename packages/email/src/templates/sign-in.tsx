import * as React from "react";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";

import { EmailFooter } from "../components/email-footer";
import { EmailHeaderLogo } from "../components/email-header-logo";
import {
  Body,
  Button,
  Container,
  Heading,
  Link,
  Separator,
  Text,
} from "../primitives";

const SignInEmailTemplate = (props: {
  firstName?: string;
  loginLink: string;
}) => {
  const previewText = `Sign in to your barely.io account`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Body>
        <Container>
          <EmailHeaderLogo />
          <Heading>Your login link</Heading>
          {props.firstName && <p>Hi {props.firstName},</p>}
          <Text>
            Please click the button below to sign in to your{" "}
            <span>
              <Link href="https://barely.io">barely.io</Link>
            </span>{" "}
            account.
          </Text>
          <Button href={props.loginLink}>Login to barely.io</Button>

          <Separator />

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

export { SignInEmailTemplate };
export default SignInEmailTemplate;
