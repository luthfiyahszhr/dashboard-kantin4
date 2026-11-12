import { AppError } from '../errors/AppError.ts';
import { ReviewRepository, type CreateReviewRecord } from '../repositories/reviewRepository.ts';
import { StallRepository } from '../repositories/stallRepository.ts';

export class ReviewService {
  private stallRepository: StallRepository;
  private reviewRepository: ReviewRepository;

  constructor(
    stallRepository: StallRepository = new StallRepository(),
    reviewRepository: ReviewRepository = new ReviewRepository(),
  ) {
    this.stallRepository = stallRepository;
    this.reviewRepository = reviewRepository;
  }

  async createReview(input: CreateReviewRecord) {
    const stall = await this.stallRepository.findById(input.stallId);
    if (!stall) throw new AppError(404, 'Data warung tidak ditemukan');

    try {
      return await this.reviewRepository.create(input);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'number' in error &&
        (error.number === 2601 || error.number === 2627)
      ) {
        throw new AppError(409, 'Pengguna sudah memberikan review untuk warung ini', [
          { field: 'stallId', message: 'Review untuk warung ini sudah pernah dibuat' },
        ]);
      }
      throw error;
    }
  }
}
