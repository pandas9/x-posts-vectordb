import {
  integer,
  pgTable,
  timestamp,
  vector,
  index,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const postsTable = pgTable(
  "posts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    authorId: integer().notNull(),
    text: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    username: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);
