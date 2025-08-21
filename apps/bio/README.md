# Bio App - Blocks-based Architecture

## Overview

The Bio app provides a flexible, blocks-based system for creating customizable bio pages for creators. Each bio page consists of modular content blocks that can be arranged, styled, and customized according to the workspace's brand kit.

## Architecture

### Core Components

1. **Bio Page Structure**

   - Header section with customizable layout styles
   - Dynamic blocks system for content
   - Email capture widget (optional)
   - Analytics tracking

2. **Block Types**
   - **Links Block**: Collection of clickable links/buttons
   - **Text Block**: Rich text content
   - **Image Block**: Image display with optional links
   - **Embed Block**: External content embedding
   - **Custom HTML Block**: Raw HTML content

### Data Flow

```
Bio App (Public)
├── Brand Kit (cached)
│   ├── Colors
│   ├── Fonts
│   └── Block Styles
├── Bio Metadata
│   ├── Header configuration
│   ├── Feature flags
│   └── Email capture settings
└── Blocks (dynamic)
    ├── Bio blocks with ordering
    ├── Nested bio links
    └── Associated form data
```

### Key Features

1. **Brand Kit Integration**

   - Centralized theming system
   - Reusable across bio, cart, and fm apps
   - Real-time preview in admin panel

2. **Email Capture**

   - Rate-limited (3 attempts per hour per IP)
   - GDPR-compliant with consent tracking
   - Integrates with fan management system

3. **Analytics**

   - Real-time event tracking via Tinybird
   - Comprehensive dashboard in admin panel
   - Track views, clicks, and conversions

4. **Performance**
   - ISR (Incremental Static Regeneration) with 60s revalidation
   - Progressive enhancement with Suspense
   - Optimized query splitting for caching

## Development

### Running Locally

```bash
# From the root of the monorepo
pnpm dev:bio
```

### Environment Variables

Required environment variables:

- Database connection (inherited from root)
- Tinybird API keys (for analytics)
- Base URLs for routing

### API Routes

- `/api/trpc/bioRender` - Public tRPC endpoint for bio rendering and interactions

## Security

- Rate limiting on email capture endpoints
- Input validation with Zod schemas
- Transaction-based data operations
- Workspace isolation for multi-tenancy

## Future Enhancements

- Additional block types (video, audio, social feeds)
- A/B testing capabilities
- Advanced analytics with conversion funnels
- Internationalization support
