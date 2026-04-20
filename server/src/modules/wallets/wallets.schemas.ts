import { z } from 'zod';
import { basePaginationSchema } from '../../utils/pagination.js';

export const NetworkSchema = z.enum([
  'TRC20',
  'ERC20',
  'BEP20',
  'POLYGON',
  'ARBITRUM',
  'OPTIMISM',
  'BASE',
]);

export const WalletStatusSchema = z.enum(['ACTIVE', 'USED', 'INACTIVE', 'ARCHIVED']);

/**
 * Reasonable minimum for on-chain addresses: TRON base58 addresses are 34
 * chars, EVM hex addresses 42. 20 is a safe low-water mark that still keeps
 * garbage out.
 */
export const AddressSchema = z.string().trim().min(20).max(120);
export const LabelSchema = z.string().trim().min(1).max(120);

export const listWalletsQuerySchema = basePaginationSchema.extend({
  network: NetworkSchema.optional(),
  status: WalletStatusSchema.optional(),
  assignedUserId: z.string().trim().min(1).max(60).optional(),
  unassigned: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'network', 'label']).default('createdAt'),
});
export type ListWalletsQuery = z.infer<typeof listWalletsQuerySchema>;

export const walletIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(60),
});

export const createWalletSchema = z.object({
  label: LabelSchema.optional(),
  address: AddressSchema,
  network: NetworkSchema,
  assignedUserId: z.string().trim().min(1).max(60).nullable().optional(),
  status: WalletStatusSchema.default('ACTIVE'),
});
export type CreateWalletInput = z.infer<typeof createWalletSchema>;

export const updateWalletSchema = createWalletSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'Provide at least one field to update.' },
);
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
