import { Suspense } from "react";
import { api } from "@barely/lib/server/api/server.edge";

import { DashContentHeader } from "~/app/[handle]/_components/dash-content-header";
import { PressKitForm } from "~/app/[handle]/press/_components/press-kit-form";

export default function PressKitPage({
  params,
}: {
  params: { handle: string };
}) {
  const pressKit = api({ handle: params.handle }).pressKit.byWorkspace({
    handle: params.handle,
  });

  return (
    <>
      <DashContentHeader title="Press Kit" />
      <Suspense fallback={"Loading..."}>
        <PressKitForm initialPressKit={pressKit} />
      </Suspense>
    </>
  );
}
