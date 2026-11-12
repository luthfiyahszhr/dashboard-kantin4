import type { Request, Response } from 'express';
import { getAuthenticatedUser } from '../middlewares/authenticate.ts';
import { ReviewService } from '../services/reviewService.ts';
import type {
  CreateReviewInput,
  StallIdParams,
} from '../validations/stallValidation.ts';

export class ReviewController {
  private reviewService: ReviewService;

  constructor(reviewService: ReviewService = new ReviewService()) {
    this.reviewService = reviewService;
  }

  createReview = async (
    req: Request,
    res: Response,
    params: StallIdParams,
    input: CreateReviewInput,
  ): Promise<Response> => {
    const user = getAuthenticatedUser(req);
    const review = await this.reviewService.createReview({
      stallId: params.id,
      userId: user.id,
      rating: input.rating,
      comment: input.comment,
    });
    return res.status(201).json({ status: 'success', data: review });
  };
}
