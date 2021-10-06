# Timer Backend

Timer backend for the multi-user simultaneous timer app.

## Setup

To run and develop the backend you would need,

- Node ([Download](https://nodejs.org/en/download/))
- Yarn ([Install using npm](https://classic.yarnpkg.com/lang/en/docs/install/))
- Docker ([Get Started](https://docs.docker.com/get-started/))

Then to install all of the depedencies, do `yarn` on the root of this folder.

To run the app itself, you must do,

1. Install all the dependecies (`yarn`)
2. Make sure you're running a Postgres Database
3. Setup `.env` if not present create one, with the following configuration,

   ```
   DATABASE_URL="postgresql://your-db-username:your-db-password@localhost:5432/your-db-name?schema=public"
   ```

   If you do not already have a running Postgres database, or wish to configure a new one for this. Follow the [New Database Setup](#new-database-setup) part of this guide.

4. Run the app using `yarn dev` this will trigger `tsc` to build the typescript file, and run `node` on the file built.

### New Database Setup

1. Pull [Docker image of Postgres](https://hub.docker.com/_/postgres)

   `docker pull postgres`

2. Create a new container for this project

   `docker run --name timerdb -e POSTGRES_USER=timerdb -e POSTGRES_PASSWORD=timerdb -p 5432:5432 -d postgres`

   This will create a new postgres database with username `timerdb` database name `timerdb` and password `timerdb` (DO NOT USE THIS IN PRODUCTION!). This will also create a new docker container which you can start again later using,

   `docker start timerdb`

3. Configure your `.env`, if you don't change any of the command on the step before, then create a new `.env` file in the root folder of this backend folder, and insert,

   `DATABASE_URL="postgresql://timerdb:timerdb@localhost:5432/timerdb?schema=public"`

4. Migrate your database, using `yarn prisma migrate dev --name init`

   And if in the development you've changed any of the schema (located at `./prisma/schema.prisma`) then do the same command with different names e.g. `yarn prisma migrate dev --name added_bonus_attributes`

5. Now you're done, your database should work with the app

## License

MIT
