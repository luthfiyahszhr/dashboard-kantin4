import {
  StallRepository,
  type CreateStallInput,
  type FindAllParams,
} from '../repositories/stallRepository.ts';
import { MenuItemRepository } from '../repositories/menuItemRepository.ts';
import type { MenuItemDto, StallResponseDto } from '../dtos/stallDto.ts';
import type { AuthenticatedUser } from '../auth/authTypes.ts';
import { AppError } from '../errors/AppError.ts';
import type { UpdateStallInput } from '../repositories/stallRepository.ts';

type StallRow = NonNullable<Awaited<ReturnType<StallRepository['findById']>>>;

export class StallService {
  private stallRepository: StallRepository;
  private menuItemRepository: MenuItemRepository;

  constructor(
    stallRepository: StallRepository = new StallRepository(),
    menuItemRepository: MenuItemRepository = new MenuItemRepository(),
  ) {
    this.stallRepository = stallRepository;
    this.menuItemRepository = menuItemRepository;
  }

  // Mapping row DB -> DTO API (sekaligus logika bisnis isPopular).
  private toDto(row: StallRow): StallResponseDto {
    const avgRating = Number(row.avgRating);
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      category: row.category,
      location: row.location,
      description: row.description,
      avgRating,
      reviewCount: row.reviewCount,
      isPopular: avgRating >= 4.7,
    };
  }

  async getAllStalls(params: FindAllParams) {
    const { rows, total } = await this.stallRepository.findAll(params);
    return { data: rows.map((row) => this.toDto(row)), total };
  }

  async getStallById(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.findById(id);
    if (!row) throw new AppError(404, 'Data warung tidak ditemukan');
    return this.toDto(row);
  }

  async getStallMenus(id: number): Promise<MenuItemDto[]> {
    const row = await this.stallRepository.findById(id);
    if (!row) throw new AppError(404, 'Data warung tidak ditemukan');
    return this.menuItemRepository.findByStallId(id);
  }

  async createStall(input: Omit<CreateStallInput, 'ownerId'>, ownerId: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.create({ ...input, ownerId });
    if (!row) throw new AppError(500, 'Warung gagal dibuat');
    return this.toDto(row);
  }

  async updateStall(
    id: number,
    input: UpdateStallInput,
    user: AuthenticatedUser,
  ): Promise<StallResponseDto> {
    const existing = await this.stallRepository.findById(id);
    if (!existing) throw new AppError(404, 'Data warung tidak ditemukan');
    if (user.role !== 'admin' && existing.ownerId !== user.id) {
      throw new AppError(403, 'Anda tidak memiliki izin untuk mengelola warung ini');
    }

    const row = await this.stallRepository.update(id, input);
    if (!row) throw new AppError(404, 'Data warung tidak ditemukan');
    return this.toDto(row);
  }

  async deleteStall(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.remove(id);
    if (!row) throw new AppError(404, 'Data warung tidak ditemukan');
    return this.toDto(row);
  }
}
