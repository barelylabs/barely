import { Suspense } from "react";
import { getCampaignById } from "@barely/server/campaign.fns";
import { db } from "@barely/server/db";
import { InfoCard } from "@barely/ui/elements/card";
import { Icon } from "@barely/ui/elements/icon";
import { Text } from "@barely/ui/elements/typography";
import { campaignTypeDisplay } from "@barely/utils/campaign";

import { DashContentHeader } from "~/app/[handle]/_components/dash-content-header";
import { LaunchPlaylistPitchForm } from "~/app/[handle]/campaign/[campaignId]/launch/launch-playlist-pitch-form";

// import { LaunchCampaignForm } from './launch-campaign-form';

const LaunchCampaignPage = async ({
  params,
}: {
  params: { campaignId: string };
}) => {
  const campaign = await getCampaignById(params.campaignId, db);

  return (
    <>
      <DashContentHeader title="Launch your campaign" />
      <Suspense fallback={<div>Loading...</div>}>
        <InfoCard
          title={campaign.track.name}
          subtitle={campaign.workspace.name}
          imageUrl={campaign.track.imageUrl}
          imageAlt={`artwork for ${campaign.track.name}`}
          stats={
            <div className="flex flex-row items-center space-x-1">
              <Icon.broadcast className="w-3" />
              <Text variant="xs/light">
                {campaignTypeDisplay(campaign.type)}
              </Text>
            </div>
          }
        >
          <Suspense fallback={<div>Loading outside genres input...</div>}>
            <LaunchPlaylistPitchForm campaignId={campaign.id} />
          </Suspense>
        </InfoCard>
      </Suspense>
    </>
  );
};

export default LaunchCampaignPage;
