import { nFormatter } from "@barely/lib/utils/number";

import { Section, SectionDiv } from "~/app/[handle]/_components/press-section";

export interface KPI {
  label: string;
  value: number;
}

export function KPIs({ kpis }: { kpis: KPI[] }) {
  return (
    <Section id="kpis">
      <SectionDiv>
        <div className="mx-auto flex w-fit flex-row items-center justify-between gap-12 md:gap-16">
          {kpis.map((kpi, i) => (
            <div
              key={`${kpi.label}.${i}`}
              className="flex w-fit flex-col items-center text-center"
            >
              <p className="font-heading text-5xl md:text-7xl lg:text-[85px]">
                {nFormatter(kpi.value)}
              </p>
              <p className="text-xs">{kpi.label}</p>
            </div>
          ))}
        </div>
      </SectionDiv>
    </Section>
  );
}
