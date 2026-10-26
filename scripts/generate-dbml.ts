import { pgGenerate } from "drizzle-dbml-generator";
import * as schema from "../src/db/schema";

pgGenerate({
  schema,
  out: "./docs/schema.dbml",
  relational: true,
});
