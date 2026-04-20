import type { User, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: User['status'];
  companyName: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

export const toPublicUser = (u: User): PublicUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  status: u.status,
  companyName: u.companyName,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
  lastLoginAt: u.lastLoginAt,
});

export interface TokenBundle {
  accessToken: string;
  refreshToken: string;
}

const issueTokens = (user: Pick<User, 'id' | 'email' | 'role'>): TokenBundle => ({
  accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
  refreshToken: signRefreshToken({ sub: user.id }),
});

export const login = async (input: LoginInput): Promise<{ user: PublicUser } & TokenBundle> => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid email or password.');
  if (user.status !== 'ACTIVE') throw new UnauthorizedError('Account is not active.');

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid email or password.');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { user: toPublicUser(user), ...issueTokens(user) };
};

export const register = async (input: RegisterInput): Promise<{ user: PublicUser } & TokenBundle> => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('A user with this email already exists.');

  if (input.password.length < 8) throw new BadRequestError('Password must be at least 8 characters.');

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      companyName: input.companyName,
      passwordHash,
      status: 'ACTIVE',
    },
  });

  return { user: toPublicUser(user), ...issueTokens(user) };
};

export const getMe = async (userId: string): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found.');
  return toPublicUser(user);
};

export const refresh = async (refreshToken: string): Promise<TokenBundle & { user: PublicUser }> => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== 'ACTIVE') throw new UnauthorizedError('User no longer active.');
  return { user: toPublicUser(user), ...issueTokens(user) };
};
