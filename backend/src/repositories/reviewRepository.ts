import { avg, count, eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { reviews, stalls } from '../db/schema.ts';

export interface CreateReviewRecord {
  stallId: number;
  userId: number;
  rating: number;
  comment?: string;
}

export class ReviewRepository {
  async create(input: CreateReviewRecord) {
    const db = await getDb();
    const review = await db.transaction(async (tx) => {
      const rows = await tx
        .insert(reviews)
        .output()
        .values({
          stallId: input.stallId,
          userId: input.userId,
          rating: input.rating,
          comment: input.comment ?? null,
          likeCount: 0,
        });
      const insertedReview = rows[0];
      if (!insertedReview) throw new Error('REVIEW_INSERT_RETURNED_NO_ROW');

      const [aggregate] = await tx
        .select({ average: avg(reviews.rating), total: count() })
        .from(reviews)
        .where(eq(reviews.stallId, input.stallId));
      await tx
        .update(stalls)
        .set({
          avgRating: Number(aggregate?.average ?? 0).toFixed(2),
          reviewCount: Number(aggregate?.total ?? 0),
        })
        .where(eq(stalls.id, input.stallId));

      return insertedReview;
    });

    return {
      id: review.id,
      stallId: review.stallId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      likeCount: review.likeCount,
      createdAt: review.createdAt,
    };
  }
}
