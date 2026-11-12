import type { Request, Response } from 'express';
import { getAuthenticatedUser } from '../middlewares/authenticate.ts';
import { AuthService } from '../services/authService.ts';
import type { LoginInput, RegisterInput } from '../services/authService.ts';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }

  register = async (res: Response, input: RegisterInput): Promise<Response> => {
    const user = await this.authService.register(input);
    return res.status(201).json({ status: 'success', data: user });
  };

  login = async (res: Response, input: LoginInput): Promise<Response> => {
    const result = await this.authService.login(input);
    return res.status(200).json({ status: 'success', data: result });
  };

  me = (req: Request, res: Response): Response => {
    const user = this.authService.getCurrentUser(getAuthenticatedUser(req));
    return res.status(200).json({ status: 'success', data: user });
  };
}
