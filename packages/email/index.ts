import type { ReadableStream } from "node:stream/web";
import type { ReactNode } from "react";
import { convert } from "html-to-text";
import pretty from "pretty";

import { env } from "./env";

interface SendEmailProps {
  to: string;
  from: string;
  subject: string;
  type: "transactional" | "marketing";
  react: JSX.Element;

  text?: string;
  html?: string;
}

export async function sendEmail(props: SendEmailProps) {
  if (props.type === "transactional") {
    try {
      const html = await renderEmailAsync(props.react);
      const text = await renderEmailAsync(props.react, { plainText: true });

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: props.from,
          to: props.to,
          subject: props.subject,
          html,
          text,
        }),
      });

      if (res.ok) return true;
    } catch (err) {
      console.error(err);
    }
  }
}

async function renderToString(children: ReactNode) {
  const ReactDOMServer = (await import("react-dom/server")).default;

  const stream = await ReactDOMServer.renderToReadableStream(children);

  const html = await readableStreamToString(
    // ReactDOMServerReadableStream behaves like ReadableStream
    // in modern edge runtimes but the types are not compatible
    stream as unknown as ReadableStream<Uint8Array>,
  );

  return (
    html
      // Remove leading doctype becuase we add it manually
      .replace(/^<!DOCTYPE html>/, "")
      // Remove empty comments to match the output of renderToStaticMarkup
      .replace(/<!-- -->/g, "")
  );
}

async function readableStreamToString(
  readableStream: ReadableStream<Uint8Array>,
) {
  let result = "";

  const decoder = new TextDecoder();

  for await (const chunk of readableStream) {
    result += decoder.decode(chunk);
  }

  return result;
}

export async function renderEmailAsync(
  component: ReactNode,
  options?: {
    pretty?: boolean;
    plainText?: boolean;
  },
) {
  const markup = await renderToString(component);

  if (options?.plainText) {
    return convert(markup, {
      selectors: [
        { selector: "img", format: "skip" },
        { selector: "#__react-email-preview", format: "skip" },
      ],
    });
  }

  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

  const document = `${doctype}${markup}`;

  if (options?.pretty) {
    return pretty(document);
  }

  return document;
}
