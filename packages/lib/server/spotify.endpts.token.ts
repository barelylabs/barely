import { z } from "zod";

import { env } from "../env";
import { zPost } from "../utils/zod-fetch";

//* ✨ ENDPOINTS ✨ *//

interface SpotifyRefreshTokenProps {
  refreshToken: string;
}

const refreshSpotifyAccessToken = async (props: SpotifyRefreshTokenProps) => {
  console.log("refreshing Spotify access token");

  const endpoint = "https://accounts.spotify.com/api/token";
  const body = {
    grant_type: "refresh_token",
    refresh_token: props.refreshToken,
  };

  const auth = `Basic ${Buffer.from(
    `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64")}`;

  const tokenRes = await zPost(endpoint, spotifyRefreshTokenResponseSchema, {
    contentType: "application/x-www-form-urlencoded",
    body,
    auth,
  });

  console.log("returned tokenRes => ", tokenRes);

  // return tokenRes;

  if (!tokenRes.success)
    throw new Error("Error refreshing Spotify access token.");
  if (!tokenRes.parsed) throw new Error("Error parsing Spotify access token.");

  return tokenRes.data;
};

export { refreshSpotifyAccessToken };

//* 📓 SCHEMA 📓 *//

const spotifyRefreshTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(), // time in seconds
  refresh_token: z.string().optional(),
});
