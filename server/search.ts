"use server";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { postsTable } from "../db/schema";
import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function searchPosts(query: string) {
  const { env } = getRequestContext();
  const dbClient = neon(env.DB_URL!);
  const db = drizzle({ client: dbClient });

  const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    compatibility: "strict",
  });
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query.replaceAll("\\n", " "),
  });

  const similarity = sql<number>`1 - (${cosineDistance(
    postsTable.embedding,
    embedding
  )})`;

  const similarPosts = await db
    .select({
      id: postsTable.id,
      name: postsTable.name,
      username: postsTable.username,
      text: postsTable.text,
      createdAt: postsTable.createdAt,
      similarity,
    })
    .from(postsTable)
    .where(gt(similarity, 0.2))
    .orderBy((t) => desc(t.similarity))
    .limit(6);

  return similarPosts;
}
