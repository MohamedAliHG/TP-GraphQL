import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createSchema } from "graphql-yoga";
import { resolvers } from "./resolvers";
import type { AppContext } from "./context";

const schemaPath = existsSync(path.join(__dirname, "schema.graphql"))
  ? path.join(__dirname, "schema.graphql")
  : path.join(process.cwd(), "src/schema.graphql");

export const schema = createSchema<AppContext>({
  typeDefs: readFileSync(schemaPath, "utf-8"),
  resolvers,
});