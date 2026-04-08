# Shopify Partner Dashboard Setup

Follow these steps to set up the Shopify app credentials needed for the barely.cart Shopify integration.

## Step 1: Create Shopify Partner Account

1. Go to https://partners.shopify.com and sign up (free)
2. Complete the partner profile

## Step 2: Create a Development Store

1. In the Partner Dashboard, go to **Stores** > **Add store**
2. Choose **Development store**
3. Set a store name (e.g., `barely-dev.myshopify.com`)
4. Add some test products with variants (including apparel with sizes)
5. Enable inventory tracking on the products

## Step 3: Create a Shopify App

1. In the Partner Dashboard, go to **Apps** > **Create app**
2. Choose **Create app manually**
3. Set:
   - **App name**: `barely.cart`
   - **App URL**: `https://app.barely.ai`
   - **Allowed redirection URL(s)**:
     - `https://app.barely.ai/api/apps/callback/shopify`
     - `http://localhost:3000/api/apps/callback/shopify` (for local dev)
4. Under **API credentials**, note:
   - **Client ID** (API key) -> becomes `SHOPIFY_CLIENT_ID`
   - **Client secret** -> becomes `SHOPIFY_CLIENT_SECRET`

## Step 4: Configure Access Scopes

In the app's configuration, request these scopes:

- `read_products` - List and read products/variants from the store
- `write_orders` - Create orders in the store
- `read_orders` - Read order status (for future fulfillment sync)
- `read_inventory` - Read inventory levels (for product mapping UI)

## Step 5: Distribution

- For now, keep the app **unlisted** (not published to Shopify App Store)
- Install it on your dev store via the Partner Dashboard for testing
- For production: either keep as unlisted (install via direct link) or eventually list on Shopify App Store

## Step 6: Add Environment Variables

Add to `.env` (and Vercel):

```
SHOPIFY_CLIENT_ID=your_client_id_here
SHOPIFY_CLIENT_SECRET=your_client_secret_here
```
