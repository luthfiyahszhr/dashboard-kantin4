import { Router } from 'express';
import { StallController } from '../controllers/stallController.ts';
import { authenticate, getAuthenticatedUser, requireRole } from '../middlewares/authenticate.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import { reviewRouter } from './reviewRouter.ts';
import {
  createStallSchema,
  stallIdParamsSchema,
  stallListQuerySchema,
  updateStallSchema,
  type CreateStallInput,
  type StallIdParams,
  type StallListQuery,
  type UpdateStallInput,
} from '../validations/stallValidation.ts';

const stallRouter = Router();
const stallController = new StallController();

stallRouter.get('/', validateRequest(stallListQuerySchema, 'query'), (req, res) => {
  // #swagger.parameters['search']   = { in: 'query', type: 'string' }
  // #swagger.parameters['category'] = { in: 'query', type: 'string' }
  // #swagger.parameters['page']     = { in: 'query', type: 'integer' }
  // #swagger.parameters['limit']    = { in: 'query', type: 'integer' }
  // #swagger.responses[200] = { description: 'Daftar warung' }
  // #swagger.responses[400] = { description: 'Validasi input gagal' }
  return stallController.getStalls(res, res.locals.validatedQuery as StallListQuery);
});

stallRouter.post(
  '/',
  authenticate(),
  requireRole('owner', 'admin'),
  validateRequest(createStallSchema, 'body'),
  (req, res) => {
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/StallInput' } }
    // #swagger.responses[201] = { description: 'Warung dibuat' }
    // #swagger.responses[400] = { description: 'Validasi input gagal' }
    // #swagger.responses[401] = { description: 'Token tidak ada atau tidak valid' }
    // #swagger.responses[403] = { description: 'Hanya owner dan admin yang dapat membuat warung' }
    return stallController.createStall(
      res,
      res.locals.validatedBody as CreateStallInput,
      getAuthenticatedUser(req),
    );
  },
);

stallRouter.get('/:id', validateRequest(stallIdParamsSchema, 'params'), (req, res) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  // #swagger.responses[200] = { description: 'Detail warung' }
  // #swagger.responses[404] = { description: 'Tidak ditemukan' }
  // #swagger.responses[400] = { description: 'Validasi input gagal' }
  return stallController.getStallById(res, res.locals.validatedParams as StallIdParams);
});

stallRouter.put(
  '/:id',
  authenticate(),
  requireRole('admin', 'owner'),
  validateRequest(stallIdParamsSchema, 'params'),
  validateRequest(updateStallSchema, 'body'),
  (req, res) => {
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/StallUpdateInput' } }
    // #swagger.responses[200] = { description: 'Warung ter-update' }
    // #swagger.responses[400] = { description: 'Validasi input gagal' }
    // #swagger.responses[401] = { description: 'Token tidak ada atau tidak valid' }
    // #swagger.responses[403] = { description: 'Tidak memiliki izin atau bukan pemilik warung' }
    // #swagger.responses[404] = { description: 'Tidak ditemukan' }
    return stallController.updateStall(
      res,
      res.locals.validatedParams as StallIdParams,
      res.locals.validatedBody as UpdateStallInput,
      getAuthenticatedUser(req),
    );
  },
);

stallRouter.delete(
  '/:id',
  authenticate(),
  requireRole('admin'),
  validateRequest(stallIdParamsSchema, 'params'),
  (req, res) => {
    // #swagger.security = [{ "BearerAuth": [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.responses[200] = { description: 'Warung terhapus' }
    // #swagger.responses[400] = { description: 'Validasi input gagal' }
    // #swagger.responses[401] = { description: 'Token tidak ada atau tidak valid' }
    // #swagger.responses[403] = { description: 'Hanya admin yang dapat menghapus warung' }
    // #swagger.responses[404] = { description: 'Tidak ditemukan' }
    return stallController.deleteStall(res, res.locals.validatedParams as StallIdParams);
  },
);

stallRouter.get(
  '/:id/menus',
  validateRequest(stallIdParamsSchema, 'params'),
  (req, res) => {
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.responses[200] = { description: 'Daftar menu' }
    // #swagger.responses[404] = { description: 'Tidak ditemukan' }
    // #swagger.responses[400] = { description: 'Validasi input gagal' }
    return stallController.getStallMenus(res, res.locals.validatedParams as StallIdParams);
  },
);

stallRouter.use('/:id/reviews', reviewRouter);

export { stallRouter };
