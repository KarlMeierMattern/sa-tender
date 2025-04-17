# About this app

## Technologies

- MongoDB for database
- Zustand for global client state (like filters)
<!-- - React Query for API/DB for caching, re-fetching, pagination, background updates, loading & error states -->

## Cloudflare

CDN caching
DDoS protection
SSL/TLS encryption
Smart routing
Web Application Firewall (WAF)

## Upstash (Redis) (server-side caching)

- Reduces database load; and
- Faster API responses.
- Use for: rate limiting.

## Pagination at API level

## React Query (client-side caaching)

- Client-side caching;
- Manages UI state and data synchronization;
- Handles loading/error states;
- Automatic background refetching;
- Used in: user-specific data, frequently changing data, client-side filtering/sorting, and optimistic updates.

Filtering & pagination
• ✅ Filters parsed in route handler (category, department, province, advertised, awarded).
• ✅ Filters passed into getAwardedTenders as an object.
• ✅ Filters applied in MongoDB query before .skip() and .limit().
• ✅ Date handling includes full-day range (midnight to 23:59) – perfect for equality-based filters.
• ✅ Pagination and total count calculated using the filtered query.
• ✅ Redis caching includes filters in the key to avoid mismatches.
