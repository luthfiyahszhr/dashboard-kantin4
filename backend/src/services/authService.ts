import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/authConfig.ts';
import type { LoginResponseDto, UserResponseDto } from '../dtos/authDto.ts';
import { AppError } from '../errors/AppError.ts';
import { UserRepository } from '../repositories/userRepository.ts';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async register(input: RegisterInput): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError(409, 'Email sudah terdaftar', [
        { field: 'email', message: 'Email sudah digunakan' },
      ]);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    return this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });
  }

  async login(input: LoginInput): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(input.email);
    const passwordMatches = user
      ? await bcrypt.compare(input.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new AppError(401, 'Email atau password tidak valid');
    }

    const safeUser: UserResponseDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(
      { role: user.role },
      getJwtSecret(),
      { algorithm: 'HS256', subject: String(user.id), expiresIn: '1h' },
    );
    return { user: safeUser, token };
  }

  getCurrentUser(user: UserResponseDto): UserResponseDto {
    return user;
  }
}
