# Case Study System - Update Guide

This document tells Claude how to update an existing case study or add a new one. Read this doc, then interview Adam for the data you need.

Last updated: 2026-04-07

---

## Architecture

### Single Source of Truth

All case study data lives in one file: `/apps/nyc/src/data/case-studies.ts`

Update that file and the entire site updates automatically:
- Home page success ticker (aggregate metrics)
- About page references
- Tools page workflow examples
- `/case-studies` listing
- `/case-studies/[slug]` detail pages

### Key Interfaces

```typescript
CaseStudyMetrics {
  monthlyListeners, monthlyStreams, monthlyStreamsPerListener?,
  monthlySaves?, monthlyPlaylistAdds?,
  totalFollowers,
  monthlyRevenue,        // formatted string e.g. '$2,500'
  totalEmailSubscribers,
  totalInstagramFollowers?, totalTikTokFollowers?,
  totalYouTubeSubscribers?, totalPatreonMembers?
}

CaseStudyInvestment {
  serviceFee,            // Rising+ market rate
  stanFee?,              // Stan account at market rate ($400/mo), even if waived
  adSpend,
  total
}

CaseStudyStrategy { title, description }
CaseStudyTimelineEvent { month, event, metric }
CaseStudyTestimonial { quote, author }
```

### Components That Render Case Study Data

- `/apps/nyc/src/components/marketing/enhanced-success-ticker.tsx`
- `/apps/nyc/src/components/marketing/artist-testimonials.tsx`
- `/apps/nyc/src/app/about/page.tsx`
- `/apps/nyc/src/app/tools/page.tsx`
- `/apps/nyc/src/app/case-studies/page.tsx`
- `/apps/nyc/src/app/case-studies/[slug]/page.tsx`

### Images

- Proper Youth: `/apps/nyc/public/_static/bands/proper-youth-local-gravity.jpg`
- The Now: `/apps/nyc/public/_static/bands/the-now-trio.jpg`

---

## How to Update an Existing Case Study

### Step 1: Interview Adam

Ask these questions in order. Be specific about what you need — don't accept vague answers.

#### A. Period & Monthly Data

> What months are we extending through? (e.g. "through September 2026")

For each new month since the last update, I need:
1. **Monthly listeners**
2. **Monthly streams**

#### B. Final Month Snapshot

For the new end month specifically, I also need:
3. **Streams per listener** (or I can calculate)
4. **Monthly saves**
5. **Monthly playlist adds**
6. **Spotify followers** (total)
7. **Monthly revenue** (in USD)
8. **Email subscribers** (total)
9. **Instagram followers** (total)
10. **TikTok followers** (total, if applicable)
11. **YouTube subscribers** (total, if applicable)

#### C. Investment

> What's the total additional ad spend since the last update?

> Have any new services been added? (e.g. Stan account — include at market rate even if waived)

> Has the service fee tier changed?

#### D. New Strategies

> Any new strategies deployed since the last update?

Examples of strategies we've added in the past:
- Stan fan account management
- Track-specific Discover Weekly pushes
- Physical merch campaigns
- Playlist building

#### E. Milestones & Key Results

> What are the major wins since the last update?

Prompt for specifics:
- Discover Weekly / algorithmic placements (which tracks?)
- Sold-out shows / tour milestones
- Merch/revenue milestones (e.g. self-funding campaigns)
- Playlist growth
- Notable fan engagement moments
- Stan account impact

#### F. Testimonial

> Does the current testimonial still reflect their story, or should it be updated?

The testimonial should reference current numbers and the most compelling narrative arc. If revenue or milestones have changed significantly, update the quote.

#### G. Challenge & Summary

> Does the challenge description still read correctly? (It describes the "before" state, so it usually doesn't change.)

> The summary will need updating — I'll draft one based on the new data.

### Step 2: Update the Data

Edit `/apps/nyc/src/data/case-studies.ts`:

1. **`endDate`** — new end date string
2. **`metrics.after`** — all fields from the final month snapshot
3. **`investment`** — updated totals (always use market rates, not internal accounting)
4. **`strategy`** — add new strategies, update descriptions of existing ones if scope changed
5. **`timeline`** — add new timeline entries for the extended months. Group logically (e.g. "Months 9-10", "Month 13"). Use the pattern: `{ month, event, metric: 'X → Y listeners' }`
6. **`keyResults`** — update growth percentages, add new wins, remove any that are now superseded
7. **`testimonial`** — update if numbers or narrative have changed
8. **`merchRevenue.after`** — update to match current monthly revenue number
9. **`summary`** — rewrite to reflect updated stats and timeframe

### Step 3: Recalculate Headline Numbers

Double-check these derived values:
- **Listener growth %**: `(after.monthlyListeners - before.monthlyListeners) / before.monthlyListeners * 100`
- **Revenue growth %**: `(after revenue number - before revenue number) / before revenue number * 100`
- **Campaign duration**: count months from startDate to endDate

These appear in `keyResults`, `summary`, and the testimonial. Make sure they're consistent everywhere.

### Step 4: Verify

```bash
pnpm -F @barely/nyc typecheck
```

Check that no `// CLIENT:`, `// DRAFT`, `// NEEDS:`, or `// PLACEHOLDER` comments exist:
```
grep -n "CLIENT:\|DRAFT\|NEEDS:\|PLACEHOLDER" apps/nyc/src/data/case-studies.ts
```

### Step 5: Commit & Push

Commit with a message like:
```
feat(nyc): update [Artist] case study through [Month Year]
```

---

## How to Add a New Case Study

1. Copy an existing case study object (e.g. `theNowCase`) in `case-studies.ts`
2. Fill in all fields following the interfaces above
3. Add to the `allCaseStudies` array
4. Add to the `caseStudies` record
5. Add artist image to `/apps/nyc/public/_static/bands/`
6. Optionally add `featuredHighlights` if the case study should be referenced on other pages (About, Tools)

The aggregate metrics, success ticker, and case studies listing page all update automatically.

---

## Important Conventions

### Market Rate Pricing

Always use what a client WOULD pay, not internal accounting:
- **Proper Youth**: $4,250 service fee (even though Adam is in the band)
- **The Now**: $5,750 service fee + $400/mo Stan (even though Stan was waived)

### Generic Timeline Labels

Use "Month 1", "Months 2-3", etc. — not calendar months. This keeps case studies evergreen. The actual dates are shown via `startDate`/`endDate`.

### Investment Fields

If the artist uses additional paid services (Stan, etc.), add them as optional fields on `CaseStudyInvestment` and render them conditionally in the detail page (`/apps/nyc/src/app/case-studies/[slug]/page.tsx`). The detail page already handles `stanFee` conditionally.

---

## Current Case Studies

### Proper Youth
- **Period**: April 2024 - October 2024 (8 months)
- **Listeners**: 5,579 -> 24,516 (340% growth)
- **Revenue**: $112 -> $3,170 (2,730% growth)
- **Investment**: $18,070
- **Status**: Complete, locked

### The Now
- **Period**: March 2025 - March 2026 (13 months)
- **Listeners**: 1,347 -> 37,000 (2,646% growth)
- **Revenue**: $16 -> $2,500 (15,525% growth)
- **Investment**: $29,679
- **Services**: Rising+ + Stan (from Feb 2026)
- **Status**: Complete, testimonial approved
- **Last updated**: 2026-04-07

---

## Resuming This Work

Say: "I want to update the [Artist] case study" and provide this doc (`CASE_STUDY_HANDOFF.md`).

Claude will:
1. Read this doc and the current case study data
2. Interview you using the checklist above
3. Update the data file
4. Verify and push
