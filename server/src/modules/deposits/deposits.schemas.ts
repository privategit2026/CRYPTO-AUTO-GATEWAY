import { z } from 'zod';
import { basePaginationSchema } from '../../utils/pagination.js';
import { NetworkSchema, AddressSchema } from '../wallets/wallets.schemas.js';

export const DepositStatusSchema = z.enum([
  'PENDING',
  'DETECTED',
  'CONFIRMING',
  'COMPLETED',
  'FAILED',
  'EXPIRED',
]);

export const TxidSchema = z.string().trim().min(12).max(200);

export const listDepositsQuerySchema = basePaginationSchema.extend({
  network: NetworkSchema.optional(),
  status: DepositStatusSchema.optional(),
  userId: z.string().trim().min(1).max(60).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'amount', 'status']).default('createdAt'),
});
export type ListDepositsQuery = z.infer<typeof listDepositsQuerySchema>;

export const depositIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(60),
});

/**
 * Amount accepts either a number or a numeric string. We store it as a
 * Decimal so arbitrary precision is preserved across networks.
 */
const AmountSchema = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === 'number' ? v.toString() : v.trim()))
  .refine((v) => /^\d+(\.\d+)?$/.test(v), { message: 'Amount must be a positive number.' })
  .refine((v) => Number(v) > 0, { message: 'Amount must be greater than zero.' });

export const createDepositSchema = z.object({
  userId: z.string().trim().min(1).max(60).nullable().optional(),
  userDisplayName: z.string().trim().min(1).max(160),
  walletId: z.string().trim().min(1).max(60).nullable().optional(),
  amount: AmountSchema,
  assetSymbol: z.string().trim().min(1).max(20).default('USDT'),
  network: NetworkSchema,
  address: AddressSchema,
  txid: TxidSchema.nullable().optional(),
  status: DepositStatusSchema.default('PENDING'),
  confirmations: z.coerce.number().int().min(0).optional(),
  requiredConfirmations: z.coerce.number().int().min(0).optional(),
  externalOrderId: z.string().trim().min(1).max(120).optional(),
});
export type CreateDepositInput = z.infer<typeof createDepositSchema>;

export const updateDepositSchema = createDepositSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'Provide at least one field to update.' },
);
export type UpdateDepositInput = z.infer<typeof updateDepositSchema>;
