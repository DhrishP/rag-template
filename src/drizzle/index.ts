import { db } from "./db/index.ts";
import dotenv from "dotenv";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { generateEmbeddings } from "../utils/voyage.ts";
import { guides } from "./db/schema.ts";

dotenv.config();

const findSimilarGuides = async (description: string) => {
  const embedding = await generateEmbeddings(description);
  if (!embedding) {
    return [];
  }
  const similarity = sql<number>`1 - (${cosineDistance(
    guides.embedding,
    embedding
  )})`;
  const similarGuides = await db
    .select({ name: guides.title, url: guides.url, similarity })
    .from(guides)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  console.log(similarGuides);
  return similarGuides;
};

const mainfunction = async () => {
  const DummyText = [
    "I want to learn about the latest trends in web development",
    // "I am youtuber with 1000 subscribers",
    "I am a developer with 10 years of experience",
    // "I am a designer with 5 years of experience",
    // "I like to eat pizza",
    // "Loneliness has a powerful effect on our health",
  ];
  for (const text of DummyText) {
    const addDummy = await generateEmbeddings(text);
    const addDummyToDb = await db.insert(guides).values({
      title: text,
      url: text,
      description: text,
      embedding: addDummy,
    });
    console.log(addDummyToDb);
  }
  const findSimilar = await findSimilarGuides(
    "what is my experience as a developer"
  );
  console.log(findSimilar);
};
mainfunction();
