import { Section, SectionDiv } from "~/app/properyouth/section";

export function PressContact() {
  return (
    <Section id="contact">
      <SectionDiv title="Contact">
        <p className="text-left text-md leading-8">
          <span className="font-semibold">Booking & Management</span>
          <br />
          Joseph Weeks
          <br />
          <a href="mailto:joseph@barelysparrow.com">joseph@barelysparrow.com</a>
        </p>
      </SectionDiv>
    </Section>
  );
}
