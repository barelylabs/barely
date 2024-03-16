// import { _Playlists_To_Tracks } from "@barely/lib/server/playlist.sql";
// import { PressKits } from "@barely/lib/server/press-kit.sql";
// import { db } from "@barely/server/db";
// import { asc, eq } from "drizzle-orm";

// // const bio = `The second album by dream pop trio Proper Youth draws the bulk of its inspiration from all three members' biggest shared passion: 80's music. It was a singular decade full of chorused guitars, analog synths, saxophone, and plenty of reverb that welcomed listeners to escape into an aural arena replete with romanticism and earnesty. The new record modernizes this approach, incorporating themes about aging, loneliness, and narcissism into a dreamy soundscape that sounds best when played loud.

// // Singers/songwriters Adam Barito and Amy Nesky and producer/drummer Bobb Barito went right back to work after releasing their debut album featuring the surprise hit, *Off My Mind*. Initially split between Ann Arbor and Brooklyn, they came together in Louisville for four months in 2020 to care for an ailing family member. It was in an apartment there that they channeled the anguish of that historic year into the groundwork of production. The intimate collaboration galvanized Amy and Adam to finally move to Brooklyn, where they spent two more years finishing the songs with Bobb in a Bedstuy studio.

// // *Rusty Grand Am* is named after a car Adam and Bobb's dad owned when they were growing up. It stuck around well after its expiration date, resilient against the unstoppable threat of decay. Revisiting the old piece of junk served as a vehicle for the thrilling and never-ending road toward the heart of nostalgia--one which Proper Youth never plans on exiting.
// //   `;

// import type { PressKit } from "@barely/lib/server/press-kit.schema";
// import type { PublicWorkspace } from "@barely/lib/server/workspace.schema";
// import type { MusicPlayerTracklist } from "@barely/ui/elements/music-player";

// import type { SocialStat } from "~/app/[handle]/_components/press-social-stats";
// import { PressBio } from "~/app/[handle]/_components/press-bio";
// import { PressContact } from "~/app/[handle]/_components/press-contact";
// import { PressHero } from "~/app/[handle]/_components/press-hero";
// import { MusicPlayerBottomBar } from "~/app/[handle]/_components/press-music-player";
// import { PressPhotos } from "~/app/[handle]/_components/press-photos";
// import { PressQuotes } from "~/app/[handle]/_components/press-quotes";
// import { PressScrollArea } from "~/app/[handle]/_components/press-scroll-area";
// import { SocialStats } from "~/app/[handle]/_components/press-social-stats";
// import { TopPlayerBar } from "~/app/[handle]/_components/press-top-player-bar";
// import { PressVideos } from "~/app/[handle]/_components/press-videos";

// const socialStats: SocialStat[] = [
//   {
//     icon: "spotify",
//     label: "Spotify Followers",
//     value: 12242,
//   },
//   {
//     icon: "spotify",
//     label: "Monthly Listeners",
//     value: 5750,
//   },
//   {
//     icon: "instagram",
//     label: "Instagram Followers",
//     value: 9882,
//   },
//   {
//     icon: "youtube",
//     label: "YouTube Subscribers",
//     value: 2440,
//   },
// ];

// // const heroPics = {
// //   avatarPic:
// //     "https://res.cloudinary.com/dregnw0zb/image/upload/v1707151055/proper_youth_-_v_-_roof_3_-square_mzh7dw.jpg",
// //   headerPic:
// //     "https://res.cloudinary.com/dregnw0zb/image/upload/v1706835629/press/proper_youth_-_h_-_bar_2_bhzdev.jpg",
// // };

// interface RenderPressKit extends PressKit {
//   workspace: PublicWorkspace;
//   tracklist?: MusicPlayerTracklist;
// }

// async function getPressKit(handle: string): Promise<RenderPressKit | null> {
//   const pressKit = await db.http.query.PressKits.findFirst({
//     where: eq(PressKits.handle, handle),
//     with: {
//       workspace: {
//         with: {
//           _avatarImages: {
//             with: {
//               image: true,
//             },
//           },
//           _headerImages: {
//             with: {
//               image: true,
//             },
//           },
//         },
//       },
//       playlist: {
//         with: {
//           _tracks: {
//             with: {
//               track: {
//                 with: {
//                   masterMp3: true,
//                 },
//               },
//             },
//             orderBy: [asc(_Playlists_To_Tracks.index)],
//           },
//         },
//       },
//     },
//   });

//   if (!pressKit) {
//     return null;
//   }

//   if (!pressKit.playlist) {
//     return pressKit;
//   }

//   const tracklist = pressKit.playlist._tracks
//     .map((ptt) => {
//       if (ptt.track.masterMp3 === null) {
//         return null;
//       } else {
//         return {
//           ...ptt.track,
//           workspace: pressKit.workspace,
//           masterMp3: ptt.track.masterMp3,
//         };
//       }
//     })
//     .flatMap((t) => (t?.masterMp3 ? t : [])) satisfies MusicPlayerTracklist;

//   return {
//     ...pressKit,
//     workspace: {
//       ...pressKit.workspace,
//       avatarImageUrl: pressKit.workspace._avatarImages[0]?.image.url,
//       headerImageUrl: pressKit.workspace._headerImages[0]?.image.url,
//     },
//     tracklist,
//   };
// }

// export default async function PressPage() {
//   const pressKit = await getPressKit("properyouth");

//   if (!pressKit) {
//     return null;
//   }

//   return (
//     <>
//       <main
//         className={`mx-auto box-border w-full max-w-5xl flex-1 overflow-hidden`}
//         style={{ height: "calc(100dvh - 72px)" }}
//       >
//         <PressScrollArea>
//           <PressHero
//             band={pressKit.workspace.name}
//             avatarPic={pressKit.workspace.avatarImageUrl ?? ""}
//             headerPic={pressKit.workspace.headerImageUrl ?? ""}
//           />

//           {pressKit.tracklist && (
//             <TopPlayerBar artistName={pressKit.workspace.name} />
//           )}

//           {pressKit.bio && <PressBio bio={pressKit.bio} />}

//           {/* //fixme - pull from db */}
//           <PressQuotes />

//           {/* //fixme - pull from db */}
//           <SocialStats stats={socialStats} />

//           {/* //fixme - pull from db */}
//           <PressVideos />

//           {/* //fixme - pull from db */}
//           <PressPhotos photos={[]} />

//           <PressContact
//             heading={pressKit.bookingHeading}
//             contactName={pressKit.bookingContact}
//             email={pressKit.bookingEmail}
//           />
//         </PressScrollArea>
//       </main>

//       {pressKit.tracklist && (
//         <MusicPlayerBottomBar tracklist={pressKit.tracklist} />
//       )}
//     </>
//   );
// }
