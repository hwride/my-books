# My books

An app for managing books you have read or would like to read.

## Getting Started

1. Run the development server: `pnpm dev`
2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies

1. Next.js
2. React
3. TypeScript
4. Tailwind
5. [PlanetScale](https://planetscale.com/docs)
5. [Prisma](https://www.prisma.io/docs)

## Setup

1. Create a local connection to the PlanetScale database: `pscale connect [database] [branch]`. This should return you a
   local address, e.g. `127.0.0.1:3306`.
1. Create a `.env` file and add Prisma config to connect to PlanetScale. E.g. using the above output you would add:
   ```properties
   DATABASE_URL='mysql://127.0.0.1:3306/[database]'
   ```
1. Run `pnpx prisma generate` to generate Prisma client from the Prisma schemas.
2. Start the development environment: `pnpm dev`
3. Go to http://localhost:3000 to see the app.

## Database

We use Prisma for our database schema and client management and PlanetScale for database hosting. 

### Useful commands

| Command                              | Description                                                                                |
|--------------------------------------|--------------------------------------------------------------------------------------------|
| `pscale connect [database] [branch]` | Create a local connection to a PlanetScale database. Used for local dev.                   |
| `pnpx prisma generate`               | Generate Prisma client from the Prisma schemas.                                            |
| `pnpx prisma db push`                | Update the currently configured remote database with the latest Prisma schema.             |
| `pnpx prisma studio`                 | Load [Prisma Studio](https://www.prisma.io/studio) for viewing and changing database data. |
