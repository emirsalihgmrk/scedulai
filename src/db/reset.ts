import { is, sql } from "drizzle-orm";
import { isPgEnum, PgTable, getTableConfig } from "drizzle-orm/pg-core";

import { db } from "@/db";
import * as schema from "@/db/schema";

// Drops every table and enum declared in db/schema.ts, so the list can never
// drift from the schema. Recreate them afterwards with `npm run db:push`.
async function reset() {
  const exports: unknown[] = Object.values(schema);
  const tables = exports
    .filter((value) => is(value, PgTable))
    .map((table) => getTableConfig(table).name);
  const enums = exports
    .filter((value) => isPgEnum(value))
    .map((pgEnum) => pgEnum.enumName);

  for (const table of tables) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
  }
  for (const pgEnum of enums) {
    await db.execute(sql.raw(`DROP TYPE IF EXISTS "${pgEnum}" CASCADE`));
  }

  console.log(
    `Database reset complete: ${tables.length} tables, ${enums.length} enums dropped.`,
  );
  process.exit(0);
}

reset().catch((err) => {
  console.error("Reset failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
