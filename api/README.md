# Autumn Applications API

## Development

Install bun: <https://bun.sh/>

1. Copy .env.example, set the empty variables and change `APPLICATION_EMAIL`, `APPLICATION_FRONTEND_URL`, `APPLICATION_BACKEND_URL`, & `SEAT_DOMAIN` to the correct values.
2. If you haven't already setup [SeAT](https://eveseat.github.io/docs/) and generate an API key at `https://seat.your-domain.com/api-admin` and then set the `SEAT_APPLICATION_KEY` variable in the .env file.
3. `bun i`
4. `bun run migrations`
5. `bun run dev`
