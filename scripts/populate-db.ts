import { postsTable } from "../db/schema";
import { createOpenAI } from "@ai-sdk/openai";
import { neon } from "@neondatabase/serverless";
import { embed } from "ai";
import { drizzle } from "drizzle-orm/neon-http";

const dummyData = [
  {
    name: "Dillion",
    username: "dillionverma",
    text: "Hello World",
    authorId: 1,
  },
  {
    name: "Tibo",
    username: "tibo_maker",
    text: `🟣 Outrank RANKED 🎯

          Got 1st yesterday on PH 🏆

          Will analyze outcome and report asap

          Thanks 𝕏 for all the support 🙏`,
    authorId: 2,
  },
  {
    name: "Tibo",
    username: "tibo_maker",
    text: `The secret sauce to creating a great Twitter account?

          Consistency. 

          Share value every day, even if it’s just one valuable insight.

          The secret sauce to creating a great Twitter account?

          Consistency. Share value every day, even if it’s just one valuable insight.`,
    authorId: 2,
  },
];

export async function populateDb() {
  const dbClient = neon(process.env.DB_URL!);
  const db = drizzle({ client: dbClient });
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    compatibility: "strict",
  });

  for (const data of dummyData) {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: data.text.replaceAll("\\n", " "),
    });
    await db.insert(postsTable).values({
      ...data,
      embedding,
    });
  }
}

populateDb();
