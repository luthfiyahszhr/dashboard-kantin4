import { Router } from 'express';
import { AuthController } from '../controllers/authController.ts';
import { authenticate } from '../middlewares/authenticate.ts';
import { validateRequest } from '../middlewares/validateRequest.ts';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '../validations/authValidation.ts';

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/register', validateRequest(registerSchema, 'body'), (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Daftar sebagai customer'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/RegisterInput' } }
  // #swagger.responses[201] = { description: 'Registrasi berhasil' }
  // #swagger.responses[400] = { description: 'Input tidak valid' }
  // #swagger.responses[409] = { description: 'Email sudah terdaftar' }
  return authController.register(res, res.locals.validatedBody as RegisterInput);
});

authRouter.post('/login', validateRequest(loginSchema, 'body'), (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login dan mendapatkan JWT'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/LoginInput' } }
  // #swagger.responses[200] = { description: 'Login berhasil' }
  // #swagger.responses[400] = { description: 'Input tidak valid' }
  // #swagger.responses[401] = { description: 'Kredensial tidak valid' }
  return authController.login(res, res.locals.validatedBody as LoginInput);
});

authRouter.get('/me', authenticate(), (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Melihat identitas pengguna aktif'
  // #swagger.security = [{ "BearerAuth": [] }]
  // #swagger.responses[200] = { description: 'Identitas pengguna' }
  // #swagger.responses[401] = { description: 'Token tidak ada atau tidak valid' }
  return authController.me(req, res);
});

export { authRouter };
