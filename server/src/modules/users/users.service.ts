import type { Prisma, User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { hashPassword } from '../../utils/password.js';
import {
  ConflictError,
  NotFoundError,
} from '../../utils/errors.js';
import {
  toPaginationParams,
  resolveSortField,
  type BasePaginationQuery,
} from '../../utils/pagination.js';
import type {
  ListUsersQuery,
  CreateUserInput,
  UpdateUserInput,
} from './users.schemas.js';
import { toPublicUser, type PublicUser } from '../auth/auth.service.js';

const SORT_WHITELIST = ['createdAt', 'updatedAt', 'name', 'role', 'status', 'email'] as const;

export const listUsers = async (
  query: ListUsersQuery,
): Promise<{ items: PublicUser[]; total: number; page: number; limit: number }> => {
  const { skip, take, page, limit } = toPaginationParams(query);
  const sortBy = resolveSortField(query.sortBy, SORT_WHITELIST, 'createdAt');

  const where: Prisma.UserWhereInput = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { companyName: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: query.sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return { items: items.map(toPublicUser), total, page, limit };
};

export const getUserById = async (id: string): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found.');
  return toPublicUser(user);
};

export const createUser = async (input: CreateUserInput): Promise<PublicUser> => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('A user with this email already exists.');

  const passwordHash = input.password ? await hashPassword(input.password) : null;

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      status: input.status,
      companyName: input.companyName,
      passwordHash,
    },
  });
  return toPublicUser(user);
};

export const updateUser = async (id: string, input: UpdateUserInput): Promise<PublicUser> => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('User not found.');

  if (input.email && input.email !== existing.email) {
    const dupe = await prisma.user.findUnique({ where: { email: input.email } });
    if (dupe) throw new ConflictError('A user with this email already exists.');
  }

  const data: Prisma.UserUpdateInput = {
    email: input.email,
    name: input.name,
    role: input.role,
    status: input.status,
    companyName: input.companyName,
  };
  if (input.password) {
    data.passwordHash = await hashPassword(input.password);
  }

  const user = await prisma.user.update({ where: { id }, data });
  return toPublicUser(user);
};

export const deleteUser = async (id: string): Promise<User> => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('User not found.');
  return prisma.user.delete({ where: { id } });
};

export type ListUsersResult = Awaited<ReturnType<typeof listUsers>>;
export type ListUsersQueryInput = BasePaginationQuery & Partial<ListUsersQuery>;
