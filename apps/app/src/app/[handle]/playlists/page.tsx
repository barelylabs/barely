import { Suspense } from "react";

import { DashContentHeader } from "../_components/dash-content-header";
import { AllPlaylists } from "./all-playlists";

const PlaylistPage = () => {
  return (
    <>
      <DashContentHeader title="Playlists" subtitle="Manage your playlists" />
      <Suspense fallback={<div>Loading...</div>}>
        <AllPlaylists />
      </Suspense>
    </>
  );
};

export default PlaylistPage;
