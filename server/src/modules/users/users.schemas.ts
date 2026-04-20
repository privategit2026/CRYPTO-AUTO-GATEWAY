import { z } from 'zod';
import { basePaginationSchema } from '../../utils/pagination.js';

export const UserRoleSchema = z.enum(['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER']);
export const UserStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);

export const listUsersQuerySchema = basePaginationSchema.extend({
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'role', 'status', 'email']).default('createdAt'),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(60),
});

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1).max(120),
  role: UserRoleSchema.default('VIEWER'),
  status: UserStatusSchema.default('ACTIVE'),
  companyName: z.string().trim().min(1).max(120).optional(),
  password: z.string().min(8).max(200).optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'Provide at least one field to update.' },
);
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
