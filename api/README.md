# Autumn Workers

## Development

Create a <https://www.cloudflare.com/> account if you haven't already.
Login to Cloudflare Workers with `npx wrangler login`

1. Install dependencies with `npm install`
2. Create d1 database with `npx wrangler d1 create autumn-workers`
3. Run migrations with `npm run migrations`
4. Run development with `npm run dev`

### Testing crons

1. Run `npx wrangler dev --test-scheduled`
2. Go to route representing cron time such as `http://localhost:8787/__scheduled?cron=17+39+*+*+*`
