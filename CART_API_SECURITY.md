# Cart Creation API Security Implementation

## Overview
The `/api/cart/create` endpoint has been secured with multiple layers of protection to prevent abuse and unauthorized access.

## Security Measures Implemented

### 1. **Rate Limiting** ✅
- **IP-based limiting**: 20 requests per minute per IP address
- **Funnel-based limiting**: 100 cart creations per hour per funnel
- Uses Upstash Redis for distributed rate limiting
- Returns proper `429 Too Many Requests` with rate limit headers

### 2. **Origin Verification** ✅
- Validates `Origin` and `Referer` headers in production
- Only allows requests from trusted domains:
  - `https://cart.barely.ai`
  - `https://preview.cart.barely.ai`
  - Configured base URL from environment
- Logs unauthorized access attempts for monitoring

### 3. **Internal API Token** ✅
- Middleware passes a secret token via `x-cart-internal-token` header
- API validates this token to authenticate internal requests
- Token is configured via `CART_INTERNAL_API_SECRET` environment variable
- Development uses default token, production requires proper secret

### 4. **CORS Protection** ✅
- Proper CORS headers set on responses
- OPTIONS handler for preflight requests
- Restricts allowed origins in production
- Controls allowed methods and headers

### 5. **Security Monitoring** ✅
- Logs all security violations to alerts channel
- Tracks:
  - Untrusted origin attempts
  - Rate limit violations (IP and funnel)
  - Failed cart creation attempts
- Integration with existing logging infrastructure

## Environment Configuration

Add to your `.env` file:
```env
# Cart API Security
CART_INTERNAL_API_SECRET=your-secure-random-token-here
```

## Usage

### Internal (from middleware)
The middleware automatically includes the security token:
```typescript
fetch(`${origin}/api/cart/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-cart-internal-token': cartEnv.CART_INTERNAL_API_SECRET,
  },
  body: JSON.stringify({
    handle,
    key,
    cartId,
    shipTo,
    visitor, // Includes IP for rate limiting
  }),
})
```

### Response Headers
The API returns rate limit information in headers:
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: ISO timestamp when limit resets

## Security Response Codes
- `403 Forbidden`: Untrusted origin or missing authentication
- `429 Too Many Requests`: Rate limit exceeded
- `400 Bad Request`: Missing required parameters
- `404 Not Found`: Funnel not found
- `500 Internal Server Error`: Cart creation failed

## Monitoring
Monitor these log channels for security events:
- **alerts**: Rate limit violations, untrusted origins
- **errors**: Cart creation failures, funnel not found

## Future Enhancements
Consider implementing:
- [ ] Request signing with HMAC for external partners
- [ ] API key management for B2B integrations
- [ ] Webhook callbacks for cart creation events
- [ ] DDoS protection at CDN level
- [ ] Request size limits
- [ ] Input sanitization for XSS protection