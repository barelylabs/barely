import type { ReactNode } from "react";
import { MDXRemote } from "@barely/ui/elements/mdx";

import { Section, SectionDiv } from "~/app/[handle]/_components/press-section";

export function PressBio({ bio }: { bio: string }) {
  const components = {
    p: ({ children }: { children?: ReactNode }) => (
      <p className="text-left text-sm sm:text-md">{children}</p>
    ),
  };

  return (
    <Section id="bio">
      <SectionDiv title="Bio">
        <MDXRemote source={bio} components={components} />
      </SectionDiv>
    </Section>
  );
}
