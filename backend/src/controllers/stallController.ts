import type { Response } from 'express';
import { StallService } from '../services/stallService.ts';
import type { AuthenticatedUser } from '../auth/authTypes.ts';
import type {
  CreateStallInput,
  StallIdParams,
  StallListQuery,
  UpdateStallInput,
} from '../validations/stallValidation.ts';

export class StallController {
  private stallService: StallService;

  constructor(stallService: StallService = new StallService()) {
    this.stallService = stallService;
  }

  getStalls = async (res: Response, query: StallListQuery): Promise<Response> => {
    const { data, total } = await this.stallService.getAllStalls({
      search: query.search,
      category: query.category,
      page: query.page,
      limit: query.limit,
    });

    return res.status(200).json({
      status: 'success',
      meta: { page: query.page, limit: query.limit, total },
      data,
    });
  };

  getStallById = async (res: Response, params: StallIdParams): Promise<Response> => {
    const stall = await this.stallService.getStallById(params.id);
    return res.status(200).json({ status: 'success', data: stall });
  };

  getStallMenus = async (res: Response, params: StallIdParams): Promise<Response> => {
    const menus = await this.stallService.getStallMenus(params.id);
    return res.status(200).json({ status: 'success', data: menus });
  };

  createStall = async (
    res: Response,
    input: CreateStallInput,
    user: AuthenticatedUser,
  ): Promise<Response> => {
    const stall = await this.stallService.createStall(input, user.id);
    return res.status(201).json({ status: 'success', data: stall });
  };

  updateStall = async (
    res: Response,
    params: StallIdParams,
    input: UpdateStallInput,
    user: AuthenticatedUser,
  ): Promise<Response> => {
    const stall = await this.stallService.updateStall(params.id, input, user);
    return res.status(200).json({ status: 'success', data: stall });
  };

  deleteStall = async (res: Response, params: StallIdParams): Promise<Response> => {
    const stall = await this.stallService.deleteStall(params.id);
    return res.status(200).json({ status: 'success', data: stall });
  };
}
