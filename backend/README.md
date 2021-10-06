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

To setup your postgres database, there will be section for it soon.

4. Run the app using `yarn dev` this will trigger `tsc` to build the typescript file, and run `node` on the file built.

## License

MIT
