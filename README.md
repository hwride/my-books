# My books

An app for managing books you have read or would like to read.

## Builds

[![example workflow](https://github.com/hwride/my-books/actions/workflows/e2e-tests.yml/badge.svg?branch=main)](https://github.com/hwride/my-books/actions/workflows/e2e-tests.yml?query=branch%3Amain)

## Technologies

1. [Next.js](https://nextjs.org/docs)
2. [React](https://react.dev/)
3. [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
4. [Tailwind](https://tailwindcss.com/)
5. [Drizzle](https://orm.drizzle.team/docs)
6. [Clerk](https://clerk.com/)
7. [Sentry](https://sentry.io/)
8. [Playwright](https://playwright.dev/)

### Deployment

1. [Vercel](https://vercel.com/dashboard) for app deployment and Vercel analytics.
2. [Supabase](https://supabase.com/docs) for database deployment.
3. [Backblaze B2 Cloud Storage](https://www.backblaze.com/cloud-storage) for file storage for images.
4. [Sentry](https://sentry.io/welcome/) for monitoring.

## Development setup

1. Setup the environment variables.
    1. Install the [Vercel CLI](https://vercel.com/docs/cli)
    1. Run [`vercel link`](https://vercel.com/docs/cli/link) in the root of the project to link it to our Vercel project.
    1. Run [`vercel env pull`](https://vercel.com/docs/cli/env#exporting-development-environment-variables) to download the development environment variables.
2. Start the development environment: `pnpm dev`.
3. Go to http://localhost:3000 to see the app.

## Database

We use Drizzle for our database schema and client management, and Supabase for database hosting.

The source of truth for our database schema is the Drizzle schema under [`drizzle/schema.ts`](drizzle/schema.ts).

### Database updates/migrations
We use [Drizzle Migrations](https://orm.drizzle.team/docs/migrations) for updating the database.

1. Update [./drizzle/schema.ts](./drizzle/schema.ts) with any changes required to the database.
1. Run `pnpm run drizzle-generate` to create migration files to go from the current state of the database to the updated state.
1. Run `pnpm run drizzle-migrate` to actually run the migration against the currently configured database.

TODO: Have this run automatically on CI for appropriate environments.

### Supabase
#### Pushing schemas
Note Supabase's free tier does not allow IPv4 to their direct connections, so we need to use the pooled connection for
the database URL.

#### Connection pooling
To make sure Drizzle works with connection pooling we need to add `?pgbouncer=true` to the end of the database URL.
TODO: Is this still true since switching from Prisma?

### Useful commands

| Command                      | Description                                                            |
|------------------------------|------------------------------------------------------------------------|
| `pnpx drizzle-kit generate`  | Generate another migration according to the latest schema changes.     |
| `pnpx drizzle-kit migrate`   | Run the latest Drizzle migration on the currently configured database. |

#### Vercel preview deploy

## Workflow for releasing to production

1. Create a GitHub pull request to `main`.
1. Merge the GitHub pull request to update the app.
1. [If there are database changes]. Change your locale `DATABASE_URL` to point to prod and run 
   `pnpm run drizzle-migrate` to update the database.

## Images

We save our book cover images to [Backblaze B2 Cloud Storage](https://www.backblaze.com/cloud-storage).

Currently when cover images are updated the old images are not deleted from Backblaze. This was not done at request time
to keep the request as quick as possible.

Instead a housekeeping script was created which deletes image files from Backblaze that are no longer referenced in the
database. The housekeeping script is under [./server/backblaze-housekeeping.ts](./server/backblaze-housekeeping.ts).

Ideally the housekeeping script should be set to run on a schedule.

### AWS S3 SDK
An important note on the AWS S3 SDK is it currently must be version 3.726.1 as Backblaze does not support extra headers
added in versions since then.

See https://www.backblaze.com/docs/cloud-storage-use-the-aws-sdk-for-javascript-v3-with-backblaze-b2.


## End-to-end (E2E) tests

We use [Playwright](https://playwright.dev/) for our end to end tests. The following commands are useful:

1. `pnpm run test:e2e`: Run the E2E tests in the terminal.
1. `pnpm run test:e2e:ui`: Run the E2E tests with the Playwright UI. Useful for dev.
1. `pnpm run test:e2e:generate`: Run the [Playwright test generator](https://playwright.dev/docs/codegen-intro). Useful for creating tests.

### Viewing test reports for component or E2E tests
If a Playwright component or E2E test job fails, we attach the Playwright report to the Action. To view this:
1. Download the report, either by going to the upload artifacts part of the job and clicking on the download link, or by
   finding the Action [here](https://github.com/hwride/my-books/actions) and going to the Artifacts section.
2. Extract the zip to a folder in the root of this repository.
3. View the report:
   1. For E2E tests use `pnpm run test:e2e:show-report`
   1. For component tests use `pnpm run test:component:show-report`