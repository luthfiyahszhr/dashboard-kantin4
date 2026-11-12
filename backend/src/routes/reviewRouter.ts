import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.ts';
import { authenticate } from '../middlewares/authenticate.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import {
  createReviewSchema,
  stallIdParamsSchema,
  type CreateReviewInput,
  type StallIdParams,
} from '../validations/stallValidation.ts';

const reviewRouter = Router({ mergeParams: true });
const reviewController = new ReviewController();

reviewRouter.post(
  '/',
  authenticate(),
  validateRequest(stallIdParamsSchema, 'params'),
  validateRequest(createReviewSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Reviews']
    // #swagger.summary = 'Menambahkan review untuk warung'
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/ReviewInput' } }
    // #swagger.responses[201] = { description: 'Review berhasil dibuat' }
    // #swagger.responses[400] = { description: 'Input tidak valid' }
    // #swagger.responses[401] = { description: 'Token tidak ada atau tidak valid' }
    // #swagger.responses[404] = { description: 'Warung tidak ditemukan' }
    // #swagger.responses[409] = { description: 'Review sudah pernah dibuat' }
    return reviewController.createReview(
      req,
      res,
      res.locals.validatedParams as StallIdParams,
      res.locals.validatedBody as CreateReviewInput,
    );
  },
);

export { reviewRouter };
