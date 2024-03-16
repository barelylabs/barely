import * as React from "react";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";

import { EmailFooter } from "../components/email-footer";
import { EmailHeaderLogo } from "../components/email-header-logo";
import {
  Body,
  EmailButton,
  EmailContainer,
  EmailHeading,
  EmailLink,
  EmailSeparator,
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
        <EmailContainer>
          <EmailHeaderLogo />
          <EmailHeading>Your login link</EmailHeading>
          {props.firstName && <p>Hi {props.firstName},</p>}
          <Text>
            Please click the button below to sign in to your{" "}
            <span>
              <EmailLink href="https://barely.io">barely.io</EmailLink>
            </span>{" "}
            account.
          </Text>
          <EmailButton href={props.loginLink}>Login to barely.io</EmailButton>

          <EmailSeparator />

          <EmailFooter />
        </EmailContainer>
      </Body>
    </Html>
  );
};

export { SignInEmailTemplate };
export default SignInEmailTemplate;
