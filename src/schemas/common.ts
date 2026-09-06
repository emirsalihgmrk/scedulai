import { ExtractTablesWithRelations } from "drizzle-orm";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { PgTransaction } from "drizzle-orm/pg-core";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof import("@/db/schema"),
  ExtractTablesWithRelations<typeof import("@/db/schema")>
>;
