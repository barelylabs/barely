import { Body as BodyPrimitive } from "@react-email/body";
import { Button as ButtonPrimitive } from "@react-email/button";
import { Container as ContainerPrimitive } from "@react-email/container";
import { Heading as HeadingPrimitive } from "@react-email/heading";
import { Hr as HrPrimitive } from "@react-email/hr";
import { Link as LinkPrimitive } from "@react-email/link";

export { Html } from "@react-email/html";

export { Preview } from "@react-email/preview";
export { Text } from "@react-email/text";

export { Head } from "@react-email/head";

export function Body(props: { children: React.ReactNode }) {
  const style = {
    fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
    backgroundColor: "#ffffff",
  };

  return <BodyPrimitive style={style}>{props.children}</BodyPrimitive>;
}

export function Button(props: { children: React.ReactNode; href: string }) {
  const style = {
    borderRadius: "0.375rem", // 0.37
    fontWeight: 600,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    display: "block",
    textAlign: "center" as const,
    paddingTop: "11px",
    paddingBottom: "11px",
    paddingLeft: "23px",
    paddingRight: "23px",
  };

  return (
    <ButtonPrimitive href={props.href} style={style}>
      {props.children}
    </ButtonPrimitive>
  );
}

export function Container(props: { children: React.ReactNode }) {
  const style = {
    display: "flex",
    paddingLeft: "1.25rem",
    paddingRight: "1.25rem",
    marginTop: "1.25rem",
    flexDirection: "column" as const,
    width: "100%",
    maxWidth: "36rem",
  };

  return (
    <ContainerPrimitive style={style}>{props.children}</ContainerPrimitive>
  );
}

export function Heading(props: { children: React.ReactNode }) {
  const style = {
    marginTop: "1.5rem",
    marginBottom: "1.5rem",
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
  };

  return <HeadingPrimitive style={style}>{props.children}</HeadingPrimitive>;
}

export function Link(props: { children: React.ReactNode; href: string }) {
  const style = {
    color: "#3182ce",
  };

  return (
    <LinkPrimitive href={props.href} style={style} target="_blank">
      {props.children}
    </LinkPrimitive>
  );
}

export function Separator() {
  return (
    <HrPrimitive
      style={{
        marginTop: "1.25rem",
        marginBottom: "1.25rem",
        borderWidth: "1px",
        width: "100%",
      }}
    />
  );
}

export function Quote(props: { children: React.ReactNode }) {
  const style = {
    display: "inline-block",
    padding: "10px 4.5%",
    width: "90.5%",
    backgroundColor: "#f4f4f4",
    borderRadius: "5px",
    border: "1px solid #eee",
    color: "#333",
    fontStyle: "italic",
  };

  return <div style={style}>- {props.children}</div>;
}
