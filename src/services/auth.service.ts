import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { config } from '../config/env';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { UserStatus } from '../types';

export class AuthService {
  async register(data: RegisterInput): Promise<{ user: Partial<IUser>; token: string }> {
    const existingUser = await User.findOne({ email: data.email });
    
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role
    });

    const token = this.generateToken(user);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    };
  }

  async login(data: LoginInput): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await User.findOne({ email: data.email }).select('+passwordHash');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new AppError('Account is inactive. Please contact administrator.', 403);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token
    };
  }

  private generateToken(user: IUser): string {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const secret = String(config.jwtSecret);

    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }
}
