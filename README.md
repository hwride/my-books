# My books

An app for managing books you have read or would like to read.

## Technologies

1. [Next.js](https://nextjs.org/docs)
2. [React](https://react.dev/)
3. [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
4. [Tailwind](https://tailwindcss.com/)
5. [Prisma](https://www.prisma.io/docs)

### Deployment
1. [Vercel](https://vercel.com/dashboard)
1. [PlanetScale](https://planetscale.com/docs)

## Development setup

1. Create a local connection to the PlanetScale database development branch: `pscale connect [database] [branch]`. This should return you a
   local address, e.g. `127.0.0.1:3306`.
1. Create a `.env` file and add Prisma config to connect to PlanetScale. E.g. using the above output you would add:
   ```properties
   DATABASE_URL='mysql://127.0.0.1:3306/[database]'
   ```
1. Run `pnpm run prisma-generate` to generate the Prisma client files from the Prisma schema.
2. Start the development environment: `pnpm dev`.
3. Go to http://localhost:3000 to see the app.

## Database

We use Prisma for our database schema and client management, and PlanetScale for database hosting. 

The source of truth for our database schema is the Prisma schema under [`prisma/schema.prisma`](prisma/schema.prisma).

### Useful commands

| Command                              | Description                                                                                                                                                          |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `pscale connect [database] [branch]` | Create a local connection to a PlanetScale database. Used for local dev.                                                                                             |
| `pnpx prisma generate`               | Generate Prisma client from the Prisma schemas.                                                                                                                      |
| `pnpx prisma db pull`                | Update the Prisma schema to be in sync with the currently configured remote database. Can be useful if you want to change the database rather than the Prisma schema |
| `pnpx prisma db push`                | Update the currently configured remote database with the latest Prisma schema.                                                                                       |
| `pnpx prisma studio`                 | Load [Prisma Studio](https://www.prisma.io/studio) for viewing and changing database data.                                                                           |

### Workflow when you want to update the database schema
1. Connect to the development branch with `pscale connect`.
1. Make schema changes to the PlanetScale branch
   1. Make any changes required to the Prisma schema file (under [`prisma/schema.prisma`](prisma/schema.prisma)).
   1. Push changes to your development database branch with `pnpx prisma db push` while development is ongoing.
   1. Make sure you notify others you are changing the database to ensure no conflicts.
1. Open pull/deploy requests when your changes are ready for review
   1. Open a pull request in GitHub for any code and schema changes.
1. Merge changes after approval
   1. Merge the PlanetScale deploy request first to ensure the database is updated.
   2. Merge the GitHub pull request.

#### Best practices
In general try and follow these [best practices](https://planetscale.com/blog/safely-making-database-schema-changes)
for schema updates.

In the future automating some of this via CI would be good

### Deploy notes
#### Building the Prisma client
To allow the Prisma client to be built for the Vercel deployments we customised the Vercel build command in 
[`package.json`](package.json)
as follows:
```json
"vercel-build": "prisma generate && next build"
```

#### Vercel preview deploy
Note that Vercel has been configured so preview branches will use the PlanetScale development database branch. This
can be found under Vercel / Settings / Environment Variables. This means in the current state you need to be careful
not to break the development branch for others.

## Workflow for releasing to production
1. Create a GitHub pull request to `main`.
1. Create a PlanetScale deploy request from development to production.
2. Merge the PlanetScale deploy request first to update the database.
3. Then merge the GitHub pull request to update the app.
