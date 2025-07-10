# Tinybird Event Schema Documentation

## Core Event Schema (`barely_events`)

### Identity & Session Fields

- `workspaceId` (String) - Workspace identifier
- `sessionId` (String) - User session identifier
- `fanId` (String, Nullable) - Fan/user identifier
- `timestamp` (DateTime) - Event occurrence time

### Event Metadata

- `type` (String) - Event type (cart, fm, link, page)
- `key` (String) - Unique event key
- `domain` (String) - Domain where event occurred
- `href` (String) - Full URL of the event
- `assetId` (String) - Asset identifier (product, link, page, etc.)

### Location Data

- `city` (String) - City name
- `country` (String) - Country code
- `latitude` (String) - Geographic latitude
- `longitude` (String) - Geographic longitude
- `region` (String) - Geographic region/state
- `zip` (String) - Postal code

### Device & Browser Information

- `ua` (String) - User agent string
- `browser` (String) - Browser name
- `browser_version` (String) - Browser version
- `engine` (String) - Rendering engine
- `engine_version` (String) - Engine version
- `os` (String) - Operating system
- `os_version` (String) - OS version
- `device` (String) - Device type (desktop, mobile, tablet)
- `device_vendor` (String) - Device manufacturer
- `device_model` (String) - Device model
- `cpu_architecture` (String) - CPU architecture
- `bot` (UInt8) - Bot detection flag

### Traffic Source & Attribution

- `referer` (String) - HTTP referer
- `referer_url` (String) - Full referer URL
- `referer_id` (String) - Referer identifier
- `sessionReferer` (String, Nullable) - Session-level referer
- `sessionRefererId` (String, Nullable) - Session referer ID
- `sessionRefererUrl` (String, Nullable) - Session referer URL

### Marketing Attribution

- `fbclid` (String, Nullable) - Facebook click ID
- `sessionEmailTemplateId` (String, Nullable) - Email template attribution
- `sessionEmailBroadcastId` (String, Nullable) - Email broadcast attribution
- `sessionFlowActionId` (String, Nullable) - Marketing flow attribution
- `sessionLandingPageId` (String, Nullable) - Landing page attribution
- `sessionMetaAdId` (String, Nullable) - Meta ad attribution
- `sessionMetaCampaignId` (String, Nullable) - Meta campaign attribution
- `sessionMetaPlacement` (String, Nullable) - Meta placement attribution
- `sessionMetaAdSetId` (String, Nullable) - Meta ad set attribution

### Reporting Flags

- `reportedToMeta` (String) - Meta pixel reporting status
- `reportedToTiktok` (String) - TikTok pixel reporting status

## Event Type Specific Fields

### Cart Events (`cart_*`)

#### Checkout Purchase Fields

- `cart_checkoutPurchase_amount` (Int16, Nullable) - Total purchase amount
- `cart_checkoutPurchase_productAmount` (Int16, Nullable) - Product subtotal
- `cart_checkoutPurchase_shippingAmount` (Int16, Nullable) - Shipping total
- `cart_checkoutPurchase_handlingAmount` (Int16, Nullable) - Handling fees

#### Main Product Fields

- `cart_checkout_mainProductId` (String, Nullable) - Main product ID
- `cart_checkout_mainProductPrice` (Int16, Nullable) - Main product price
- `cart_checkout_mainProductPayWhatYouWant` (UInt8, Nullable) - PWYW flag
- `cart_checkoutPurchase_mainProductAmount` (Int16, Nullable) - Main product total
- `cart_checkoutPurchase_mainProductQuantity` (Int16, Nullable) - Quantity
- `cart_checkoutPurchase_mainShippingAmount` (Int16, Nullable) - Main shipping
- `cart_checkoutPurchase_mainHandlingAmount` (Int16, Nullable) - Main handling

#### Bump Product Fields

- `cart_checkout_bumpProductId` (String, Nullable) - Bump product ID
- `cart_checkout_bumpProductPrice` (Int32, Nullable) - Bump price
- `cart_checkoutPurchase_bumpProductAmount` (Int16, Nullable) - Bump total
- `cart_checkoutPurchase_bumpProductQuantity` (Int16, Nullable) - Bump quantity
- `cart_checkoutPurchase_bumpShippingAmount` (Int16, Nullable) - Bump shipping
- `cart_checkoutPurchase_bumpHandlingAmount` (Int16, Nullable) - Bump handling

#### Upsell Fields

- `cart_upsell_upsellProductId` (String, Nullable) - Upsell product ID
- `cart_upsellPurchase_amount` (Int16, Nullable) - Upsell total
- `cart_upsellPurchase_upsellProductAmount` (Int16, Nullable) - Upsell product amount
- `cart_upsellPurchase_upsellProductPrice` (Int16, Nullable) - Upsell price
- `cart_upsellPurchase_upsellProductQuantity` (Int16, Nullable) - Upsell quantity
- `cart_upsellPurchase_upsellShippingAmount` (Int16, Nullable) - Upsell shipping
- `cart_upsellPurchase_upsellHandlingAmount` (Int16, Nullable) - Upsell handling

#### Landing Page Fields

- `cart_landingPageId` (String, Nullable) - Landing page ID
- `cart_landingPage_mainProductId` (String, Nullable) - Landing page product

### Link Events (`link*`)

- `linkClickDestinationAssetId` (String) - Destination asset ID
- `linkClickDestinationHref` (String) - Destination URL
- `linkType` (String) - Type of link
- `platform` (String) - Platform identifier

### FM Events (`fm*`)

- `fmLinkPlatform` (String, Nullable) - Music platform (spotify, apple, etc.)

## Storage Configuration

- **Engine**: MergeTree
- **Partition Key**: `toYear(timestamp)` - Yearly partitions
- **Sorting Key**: `timestamp, workspaceId, assetId` - Optimized for time-based queries per workspace

## Event Types

### Cart Events

- `cart__product_view` - Product page view
- `cart__add_to_cart` - Item added to cart
- `cart__checkout_start` - Checkout initiated
- `cart__checkout_purchase` - Purchase completed
- `cart__upsell_view` - Upsell page view
- `cart__upsell_purchase` - Upsell purchased

### FM Events

- `fm__page_view` - Artist/music page view
- `fm__link_click` - Music platform link click
- `fm__play` - Track played
- `fm__share` - Content shared

### Link Events

- `link__click` - Short link clicked
- `link__redirect` - User redirected

### Page Events

- `page__view` - Landing page view
- `page__cta_click` - Call-to-action clicked
- `page__form_submit` - Form submitted
