// replace everything but the getArticlesById function - we'll do that in a sec

import { eq } from "drizzle-orm";
import db from "@/db/index";
import { articles, usersSync } from "@/db/schema";

export async function getArticles() {
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));
  return response;
}
