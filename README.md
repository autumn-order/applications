# Autumn Applications

The applications website for EVE Online corporations [The Order of Autumn](https://zkillboard.com/corporation/98785281/) & [Autumn Highsec Division](https://zkillboard.com/corporation/98784256/), part of [Black Rose](https://black-rose.space/) alliance & Phoenix Coalition.

This application uses a separated frontend with [SvelteKit](https://svelte.dev/) and a backend with [hono](https://hono.dev/), both are written in [TypeScript](https://www.typescriptlang.org/) and ran with [Bun](https://bun.sh/).

This application connects with your [SeAT](https://eveseat.github.io/docs/) instance to validate completion of setup steps and has the applicant answer a few questions with their application. Following that recruiters can accept, reject, or cancel the application.

Additionally Discord webhooks can be configured to notify of new applications or actions taken on applications.

## Running in Production

### Docker

Docker is the recommended and easiest approach for running this application in production.

- Install docker: <https://www.docker.com/>

Running the application
1. Copy .env.example, set the empty variables and change , `APPLICATION_EMAIL`, `APPLICATION_FRONTEND_URL`, `APPLICATION_BACKEND_URL`, & `SEAT_DOMAIN` to the correct values.
2. If you haven't already setup [SeAT](https://eveseat.github.io/docs/) and generate an API key at `https://seat.your-domain.com/api-admin` and then set the `SEAT_APPLICATION_KEY` variable in the .env file.
2. Run the application using

```bash
docker-compose up -d
```

## Development

For development see the individual READMEs for the [web](./web/README.md) and [api](./api/README.md) applications.

## Contribution

Contributions are always welcome, feel free to open an issue or pull request if you wish to contribute to this application.
