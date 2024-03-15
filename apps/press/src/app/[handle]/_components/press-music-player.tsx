"use client";

import React from "react";
import {
  currentTrackAtom,
  HeadlessMusicPlayer,
  MusicPlayerBar,
  tracklistAtom,
} from "@barely/ui/elements/music-player";
import { useHydrateAtoms } from "jotai/utils";

// import type { PublicFile } from "@barely/lib/server/file.schema";
// import type { PublicWorkspace } from "@barely/lib/server/workspace.schema";
import type { MusicPlayerTracklist } from "@barely/ui/elements/music-player";

/** FROM DB */
// const properYouthWorkspace: PublicWorkspace = {
//   id: "1",
//   name: "Proper Youth",
//   type: "band",
//   handle: "properyouth",
//   imageUrl:
//     "https://res.cloudinary.com/dregnw0zb/image/upload/v1707178392/02_Edited_Adrenaline_rough_10-21-2023_3-PnTPro_03_b2gl1y.jpg",
// };

// const editedAdrenalineMp3: PublicFile = {
//   id: "1",
//   name: "Edited Adrenaline",
//   url: "https://res.cloudinary.com/dregnw0zb/video/upload/v1707759351/02_EditedAdrenaline_FinalMaster_20240211_yov86m.m4a",
//   height: null,
//   type: "audio",
//   width: null,
//   size: 100,
//   extension: "mp3",
//   duration: 100,
//   fps: null,
// };

// const modernCowboyMp3: PublicFile = {
//   id: "2",
//   name: "Modern Cowboy",
//   url: "https://res.cloudinary.com/dregnw0zb/video/upload/v1707759356/01_ModernCowboy_FinalMaster_20240211_q9dv1d.m4a",
//   height: null,
//   type: "audio",
//   width: null,
//   size: 100,
//   extension: "mp3",
//   duration: 100,
//   fps: null,
// };

// const rustyGrandAmMp3: PublicFile = {
//   id: "3",
//   name: "Rusty Grand Am",
//   url: "https://res.cloudinary.com/dregnw0zb/video/upload/v1707759352/05_RustyGrandAm_FinalMaster_20240211_yhsfc7.m4a",
//   height: null,
//   type: "audio",
//   width: null,
//   size: 100,
//   extension: "mp3",
//   duration: 100,
//   fps: null,
// };

// const localGravityMp3: PublicFile = {
//   id: "4",
//   name: "Local Gravity",
//   url: "https://res.cloudinary.com/dregnw0zb/video/upload/v1707759353/07_LocalGravity_FinalMaster_20240211_efj173.m4a",
//   height: null,
//   type: "audio",
//   width: null,
//   size: 100,
//   extension: "mp3",
//   duration: 100,
//   fps: null,
// };

// const playlist: MusicPlayerTracklist = [
//   {
//     id: "1",
//     name: "Edited Adrenaline",
//     workspace: properYouthWorkspace,
//     imageUrl:
//       "https://res.cloudinary.com/dregnw0zb/image/upload/v1707332383/edited_adrenaline_-_single_art_jpafqq.jpg",
//     masterMp3: editedAdrenalineMp3,
//   },
//   {
//     id: "2",
//     name: "Local Gravity",
//     workspace: properYouthWorkspace,
//     imageUrl:
//       "https://res.cloudinary.com/dregnw0zb/image/upload/v1707332385/local_gravity_-_single_art_idypxe.jpg",
//     masterMp3: localGravityMp3,
//   },
//   {
//     id: "3",
//     name: "Modern Cowboy",
//     workspace: properYouthWorkspace,
//     imageUrl:
//       "https://res.cloudinary.com/dregnw0zb/image/upload/v1707332383/modern_cowboy_-_single_art_cvd2bo.jpg",
//     masterMp3: modernCowboyMp3,
//   },
//   {
//     id: "4",
//     name: "Rusty Grand Am",
//     workspace: properYouthWorkspace,
//     imageUrl:
//       "https://res.cloudinary.com/dregnw0zb/image/upload/v1707332379/rusty_grandam_-_single_art_q7gadb.jpg",
//     masterMp3: rustyGrandAmMp3,
//   },
// ];

export function MusicPlayerBottomBar({
  tracklist: tracklist,
}: {
  tracklist: MusicPlayerTracklist;
}) {
  useHydrateAtoms([
    [tracklistAtom, tracklist],
    [currentTrackAtom, tracklist[0]],
  ]);

  return (
    <>
      <HeadlessMusicPlayer />
      <MusicPlayerBar />
    </>
  );
}
