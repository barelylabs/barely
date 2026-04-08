# Spotify Extended Quota Mode - Application Guide

## Overview

To offer Spotify pre-saves to unlimited fans, barely.ai needs **Extended Quota Mode** for our Spotify Web API app. As of May 2025, Spotify reserves Extended Quota for apps meeting specific criteria.

## Current Status (April 2026)

### Development Mode Limitations
- **5 authorized users** per app (down from 25, as of Feb 2026)
- Requires **Spotify Premium** account for the developer
- Limited API endpoints (though library endpoints are available)
- Suitable for internal testing only

### Extended Quota Requirements
1. **Registered business entity** - barely.ai / Barely Labs meets this
2. **Active, launched service** - barely.ai is live and serving creators
3. **250,000+ monthly active users** - This is the primary barrier
4. **Available in key Spotify markets** - barely.fm is accessible globally
5. **Company email required** for application submission

## Testing with Development Mode (Phase 1)

### What We Can Do Now
1. Add up to **5 Spotify accounts** to the app's allowlist in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Test the complete pre-save flow end-to-end:
   - Fan OAuth authorization
   - Token storage and refresh
   - Library save on release day
   - Email notifications
3. Validate the UX and fix any issues before scaling

### Setting Up Test Users
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select the barely.ai app
3. Navigate to **Settings** > **User Management**
4. Add test users' Spotify email addresses (max 5)
5. Each test user must have a Spotify account (Premium not required for users, only for the developer)

### Required Scopes
Our app requests these scopes for pre-save functionality:
- `user-library-modify` - Save tracks to the fan's Spotify library
- `user-read-email` - Get the fan's email for marketing list building

### Redirect URI Configuration
Add the following redirect URIs in the Spotify Developer Dashboard:
- **Production:** `https://barely.fm/api/spotify/callback`
- **Preview:** `https://<preview-url>/api/spotify/callback`
- **Development:** `https://localhost:3002/api/spotify/callback`

## Applying for Extended Quota (Phase 2)

### When to Apply
Apply when barely.ai can demonstrate:
- Significant monthly traffic across barely.fm pages
- A working, polished pre-save feature (tested with dev users)
- Clear value proposition for Spotify's ecosystem

### Application Process
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select the barely.ai app
3. Navigate to **Settings** > **Extension Request**
4. Fill out the Partner Application form

### What the Application Asks For
- **App description**: What the app does and how it uses the Spotify API
- **Use case**: How pre-saves benefit artists and drive Spotify engagement
- **OAuth scopes**: Which scopes you need and why
- **Monetization**: How the service generates revenue
- **Monthly active users**: Proof of MAU (analytics screenshots)
- **Market availability**: Which countries/markets the service operates in
- **Company information**: Legal entity details, company email

### Crafting a Strong Application

#### Key Messaging Points
1. **Artist discovery alignment**: barely.ai is a music marketing platform that directly drives listeners to Spotify. Pre-saves generate first-day streams that feed Spotify's algorithmic recommendations (Release Radar, Discover Weekly)
2. **Creator empowerment**: We help indie artists build sustainable careers - the same mission Spotify supports through Spotify for Artists
3. **Data responsibility**: We only request the minimum scopes needed (`user-library-modify`, `user-read-email`). We don't access playback data, playlists, or any other user data
4. **Technical quality**: Our implementation follows all Spotify Developer Policy guidelines, uses server-side token management, and handles token refresh properly

#### MAU Strategy
While barely.ai may not have 250K logged-in users, consider framing MAU as:
- **Unique monthly visitors** across all barely.fm pages (FM page views)
- **Unique link clicks** (fans interacting with music links)
- **Combined platform traffic** (app.barely.ai + barely.fm + other apps)

Provide analytics screenshots from:
- Vercel Analytics (unique visitors)
- Tinybird (event data showing unique IPs/sessions)
- Google Analytics if configured

#### Sample Application Text

> **App Name:** barely.ai - Music Marketing Platform
>
> **Description:** barely.ai is an open-source marketing platform for independent music creators. Our FM pages (barely.fm) are music smart links that help artists drive listeners to their music across all streaming platforms. We're adding Spotify pre-save functionality to help artists build release-day momentum, which directly benefits Spotify's recommendation algorithms through strong first-day engagement signals.
>
> **Scopes Requested:**
> - `user-library-modify`: To save pre-saved tracks to fans' Spotify libraries on release day
> - `user-read-email`: To identify fans and send release notifications
>
> **How it works:** Artists create FM pages for upcoming releases. Fans click "Pre-save" and authorize via Spotify OAuth. On release day, our system automatically saves the track to each fan's Spotify library and sends an email notification. After release, the pre-save button converts to a standard "Play on Spotify" link.
>
> **Value to Spotify:** Pre-saves directly drive first-day streams, which are critical for Spotify's Release Radar algorithm. By making pre-saves accessible to indie artists (not just major labels), we help diversify Spotify's recommendation pipeline and support emerging artists.

### Timeline Expectations
- **Review period**: Approximately 6 weeks
- **Possible outcomes**: Approved, denied, or feedback requesting changes
- **If denied**: Address feedback and resubmit. Focus on growing MAU and demonstrating value

## API Endpoint Details

### New Library Endpoint (Feb 2026+)
```
PUT https://api.spotify.com/v1/me/library
Query params: uris=spotify:track:{id1},spotify:track:{id2}
Headers: Authorization: Bearer {access_token}
Max 40 items per request
```

### Legacy Endpoint (Extended Quota apps)
```
PUT https://api.spotify.com/v1/me/tracks
Body: { "ids": ["{id1}", "{id2}"] }
Headers: Authorization: Bearer {access_token}
Max 50 items per request
```

Our implementation tries the new endpoint first and falls back to legacy.

## Security & Privacy Considerations

- Fan Spotify tokens are stored encrypted in the database
- Tokens are only used for the specific pre-save action the fan authorized
- We never access fan listening history, playlists, or other personal data
- Fans can revoke access anytime via their Spotify account settings
- We comply with GDPR and other privacy regulations

## References

- [Spotify Quota Modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [Spotify Developer Policy](https://developer.spotify.com/policy)
- [Feb 2026 Migration Guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
- [Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- [Scopes Reference](https://developer.spotify.com/documentation/web-api/concepts/scopes)
