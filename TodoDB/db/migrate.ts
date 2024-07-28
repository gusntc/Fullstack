import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { connectionString } from "@db/utils";

const dbConn = postgres(connectionString, { max: 1 });

async function main() {
  await migrate(drizzle(dbConn), {
    migrationsFolder: "./db/migration",
    migrationsSchema: "drizzle", // Default schema
  });
  await dbConn.end();
}

main();

// Record from change DB write to drizzle schema (log of migration)

// 'npx drizzle-kit generate' : create migration file

// 'npx ts-node ./db/migrate.ts' : run file TypeScript (.ts) name migrate.ts by using ts-node for run