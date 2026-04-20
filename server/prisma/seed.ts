/**
 * Development seed — mirrors `src/mock/*` from the frontend so the admin UI
 * shows familiar data after a fresh migration.
 *
 * Run: `npm run db:seed` (from the server/ directory). Requires DATABASE_URL.
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import {
  PrismaClient,
  Prisma,
  type ApiKeyPermission,
  type CryptoNetwork,
  type DepositStatus,
  type UserRole,
  type UserStatus,
  type WalletStatus,
  type ActivityCategory,
  type ActivitySeverity,
} from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? 'Password123!';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

const sha256 = (input: string) => createHash('sha256').update(input).digest('hex');

async function main() {
  console.log('▶ Clearing existing data…');
  await prisma.$transaction([
    prisma.activityLog.deleteMany(),
    prisma.deposit.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  // ─── Users ────────────────────────────────────────────────────────────
  const usersData: Array<{
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    companyName?: string;
  }> = [
    { email: 'root@cryptogate.local',     name: 'Root Admin',      role: 'SYSTEM_ADMIN', status: 'ACTIVE',   companyName: 'CryptoGate' },
    { email: 'alice@cryptogate.local',    name: 'Alice Johnson',   role: 'ADMIN',        status: 'ACTIVE',   companyName: 'CryptoGate' },
    { email: 'bob@merchantdesk.local',    name: 'Bob Smith',       role: 'MANAGER',      status: 'ACTIVE',   companyName: 'MerchantDesk' },
    { email: 'carol@merchantdesk.local',  name: 'Carol White',     role: 'VIEWER',       status: 'ACTIVE',   companyName: 'MerchantDesk' },
    { email: 'david@partnerpay.local',    name: 'David Brown',     role: 'VIEWER',       status: 'INACTIVE', companyName: 'PartnerPay' },
    { email: 'eve@partnerpay.local',      name: 'Eve Davis',       role: 'MANAGER',      status: 'ACTIVE',   companyName: 'PartnerPay' },
    { email: 'frank@cryptogate.local',    name: 'Frank Miller',    role: 'ADMIN',        status: 'ACTIVE',   companyName: 'CryptoGate' },
    { email: 'grace@digitalgoods.local',  name: 'Grace Lee',       role: 'VIEWER',       status: 'ACTIVE',   companyName: 'Digital Goods Inc' },
    { email: 'henry@digitalgoods.local',  name: 'Henry Wilson',    role: 'VIEWER',       status: 'INACTIVE', companyName: 'Digital Goods Inc' },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.create({
        data: { ...u, passwordHash },
      }),
    ),
  );
  const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));
  console.log(`  ✓ ${users.length} users`);

  // ─── Wallets ──────────────────────────────────────────────────────────
  const walletsData: Array<{
    email: string | null;
    label?: string;
    address: string;
    network: CryptoNetwork;
    status: WalletStatus;
  }> = [
    { email: 'alice@cryptogate.local',   label: 'Alice hot wallet',       address: 'TQ9zn7A3ZuqV6xF2mW8Rh4NkCE5pr1Abd',                network: 'TRC20', status: 'USED'     },
    { email: 'bob@merchantdesk.local',   label: 'Merchant primary TRC20', address: 'TY8mbtR7NLwkzX9ebtQJ6bdBqWmwEd4RtP',                network: 'TRC20', status: 'ACTIVE'   },
    { email: 'carol@merchantdesk.local', label: 'ERC-20 operations',      address: '0x63e7129d83460f431f3f8f31b0d5d7b24fe214d8',         network: 'ERC20', status: 'ACTIVE'   },
    { email: 'eve@partnerpay.local',     label: 'BEP-20 payouts',         address: '0xa6dc4f5079bb389f24673247659fbb76d2752b4e',         network: 'BEP20', status: 'ACTIVE'   },
    { email: 'david@partnerpay.local',   label: 'Archived TRC20',         address: 'TG5cg1o8q1R9yzqT7VV2uakPW8qcnr44xs',                 network: 'TRC20', status: 'USED'     },
    { email: 'grace@digitalgoods.local', label: 'Prod ERC20',             address: '0x87f23394324d0789d7cb4c6f85b94af0cb682c92',         network: 'ERC20', status: 'INACTIVE' },
    { email: 'henry@digitalgoods.local', label: 'Test BEP20',             address: '0xcc1e70a33a755ccbcbff812a1af21f36764a1747',         network: 'BEP20', status: 'ACTIVE'   },
    { email: null,                       label: 'Unassigned pool TRC20',  address: 'TNm7wwqp24S8BbTV7BhmJ4Jq4kPxfY2eAM',                network: 'TRC20', status: 'ACTIVE'   },
  ];

  const wallets = await Promise.all(
    walletsData.map((w) =>
      prisma.wallet.create({
        data: {
          label: w.label,
          address: w.address,
          network: w.network,
          status: w.status,
          assignedUserId: w.email ? byEmail[w.email]!.id : null,
        },
      }),
    ),
  );
  const walletKey = (net: CryptoNetwork, addr: string) => `${net}:${addr}`;
  const walletByNetAddr = Object.fromEntries(
    wallets.map((w) => [walletKey(w.network, w.address), w]),
  );
  console.log(`  ✓ ${wallets.length} wallets`);

  // ─── Deposits ─────────────────────────────────────────────────────────
  const depositsData: Array<{
    email: string | null;
    displayName: string;
    amount: string;
    network: CryptoNetwork;
    address: string;
    txid: string;
    status: DepositStatus;
  }> = [
    { email: 'alice@cryptogate.local',   displayName: 'Alice Johnson', amount: '500',  network: 'TRC20', address: 'TQ9zn7A3ZuqV6xF2mW8Rh4NkCE5pr1Abd',         txid: '7f3c2e91a0bb41c99edc811d33a2e2d47b3a91e06f9d5bb67dc13ec04d2a9072', status: 'COMPLETED'  },
    { email: 'bob@merchantdesk.local',   displayName: 'Bob Smith',     amount: '1200', network: 'TRC20', address: 'TY8mbtR7NLwkzX9ebtQJ6bdBqWmwEd4RtP',         txid: 'b7ac351c89a94ea5ab3f7d0f8d152c216d904d640214bc928a9d9e534f433f12', status: 'PENDING'    },
    { email: 'carol@merchantdesk.local', displayName: 'Carol White',   amount: '250',  network: 'ERC20', address: '0x63e7129d83460f431f3f8f31b0d5d7b24fe214d8', txid: '0x42f89ee3f6d12f001b6cf6dcb2128b9308d9ad56bff7c8a75f83d8e504aaf916', status: 'DETECTED'   },
    { email: 'david@partnerpay.local',   displayName: 'David Brown',   amount: '3000', network: 'TRC20', address: 'TG5cg1o8q1R9yzqT7VV2uakPW8qcnr44xs',         txid: '9ef614ca8c3f4b55b6b4d56be014e011890bb0bd5e191a4fe2c47d231d638d2a', status: 'CONFIRMING' },
    { email: 'eve@partnerpay.local',     displayName: 'Eve Davis',     amount: '750',  network: 'BEP20', address: '0xa6dc4f5079bb389f24673247659fbb76d2752b4e', txid: '0x653c8f676c49494aeaf7f208f1f0172a354ce887fd14753eca88e6fc41a5d7e2', status: 'PENDING'    },
    { email: 'frank@cryptogate.local',   displayName: 'Frank Miller',  amount: '100',  network: 'TRC20', address: 'TNm7wwqp24S8BbTV7BhmJ4Jq4kPxfY2eAM',         txid: '127d67cd65054c068b0b3a532488042f582d3260e3451a0c087c99ca81a90f8b', status: 'COMPLETED'  },
    { email: 'grace@digitalgoods.local', displayName: 'Grace Lee',     amount: '2500', network: 'ERC20', address: '0x87f23394324d0789d7cb4c6f85b94af0cb682c92', txid: '0xaab04f5e9b604355879e97a31cc260789a7a9d0c53c80c47ca60637b363fe33d', status: 'COMPLETED'  },
    { email: 'henry@digitalgoods.local', displayName: 'Henry Wilson',  amount: '800',  network: 'BEP20', address: '0xcc1e70a33a755ccbcbff812a1af21f36764a1747', txid: '0xbb728ad494f4c6e1843271dc78346fc9d31a3d24589f10a68eb01d515b928022', status: 'PENDING'    },
  ];

  for (const d of depositsData) {
    const user = d.email ? byEmail[d.email] : null;
    const wallet = walletByNetAddr[walletKey(d.network, d.address)];
    const detectedAt = ['DETECTED', 'CONFIRMING', 'COMPLETED'].includes(d.status) ? new Date() : null;
    const completedAt = d.status === 'COMPLETED' ? new Date() : null;

    await prisma.deposit.create({
      data: {
        userId: user?.id ?? null,
        userDisplayName: d.displayName,
        walletId: wallet?.id ?? null,
        amount: new Prisma.Decimal(d.amount),
        assetSymbol: 'USDT',
        network: d.network,
        address: d.address,
        txid: d.txid,
        status: d.status,
        confirmations: d.status === 'COMPLETED' ? 20 : d.status === 'CONFIRMING' ? 6 : 0,
        requiredConfirmations: d.network === 'TRC20' ? 19 : 12,
        detectedAt,
        completedAt,
      },
    });
  }
  console.log(`  ✓ ${depositsData.length} deposits`);

  // ─── API keys ─────────────────────────────────────────────────────────
  const apiKeySeed: Array<{
    email: string;
    name: string;
    merchant: string;
    permissions: ApiKeyPermission[];
    plaintext: string;
  }> = [
    { email: 'grace@digitalgoods.local', name: 'Production Key',    merchant: 'Digital Goods Inc', permissions: ['READ', 'WRITE', 'WEBHOOKS'], plaintext: 'pk_live_TRX9xAb1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St' },
    { email: 'bob@merchantdesk.local',   name: 'Sandbox / Test Key',merchant: 'MerchantDesk',       permissions: ['READ', 'WRITE'],             plaintext: 'pk_test_7yCd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0Uv1Wx' },
    { email: 'alice@cryptogate.local',   name: 'Internal Ops',      merchant: 'CryptoGate',         permissions: ['READ'],                      plaintext: 'pk_live_OPS1234567890abcdefABCDEF01234567' },
  ];

  for (const k of apiKeySeed) {
    const user = byEmail[k.email]!;
    const tail = k.plaintext.slice(-4);
    const prefix = k.plaintext.startsWith('pk_test_') ? 'pk_test_' : 'pk_live_';
    await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: k.name,
        merchant: k.merchant,
        keyHash: sha256(k.plaintext),
        keyPreview: `${prefix}${'•'.repeat(8)}${tail}`,
        permissions: k.permissions,
        status: 'ACTIVE',
        rateLimit: 5000,
        requestsToday: Math.floor(Math.random() * 1200),
      },
    });
  }
  console.log(`  ✓ ${apiKeySeed.length} API keys`);

  // ─── Activity ─────────────────────────────────────────────────────────
  const activitySeed: Array<{
    action: string;
    category: ActivityCategory;
    description: string;
    severity: ActivitySeverity;
    actorEmail?: string;
  }> = [
    { action: 'deposit.create',   category: 'DEPOSIT',  description: 'New TRC20 deposit of 500 USDT received',          severity: 'INFO',    actorEmail: 'alice@cryptogate.local' },
    { action: 'deposit.advance',  category: 'DEPOSIT',  description: 'Deposit moved to COMPLETED',                       severity: 'SUCCESS', actorEmail: 'alice@cryptogate.local' },
    { action: 'wallet.create',    category: 'WALLET',   description: 'New ERC20 wallet added to pool',                    severity: 'SUCCESS', actorEmail: 'frank@cryptogate.local' },
    { action: 'user.create',      category: 'USER',     description: 'New viewer account provisioned',                    severity: 'INFO',    actorEmail: 'alice@cryptogate.local' },
    { action: 'apiKey.create',    category: 'API',      description: 'Issued Production API key for Digital Goods Inc',  severity: 'SUCCESS', actorEmail: 'alice@cryptogate.local' },
    { action: 'auth.login',       category: 'AUTH',     description: 'Admin signed in from 10.0.0.12',                    severity: 'INFO',    actorEmail: 'alice@cryptogate.local' },
    { action: 'auth.login.fail',  category: 'SECURITY', description: 'Failed login attempt for bob@merchantdesk.local',  severity: 'WARNING'                                          },
    { action: 'deposit.update',   category: 'DEPOSIT',  description: 'Deposit marked CONFIRMING',                         severity: 'INFO',    actorEmail: 'eve@partnerpay.local' },
    { action: 'wallet.update',    category: 'WALLET',   description: 'Wallet status set to INACTIVE',                     severity: 'INFO',    actorEmail: 'alice@cryptogate.local' },
    { action: 'apiKey.update',    category: 'API',      description: 'Rate limit raised to 10 000/min',                   severity: 'INFO',    actorEmail: 'alice@cryptogate.local' },
    { action: 'system.seed',      category: 'SYSTEM',   description: 'Database seeded from prisma/seed.ts',               severity: 'SUCCESS'                                         },
    { action: 'deposit.detect',   category: 'DEPOSIT',  description: 'On-chain detection hit for ERC20 wallet',           severity: 'INFO'                                            },
    { action: 'wallet.sync',      category: 'WALLET',   description: 'Wallet sync run complete — 7 wallets scanned',      severity: 'INFO'                                            },
    { action: 'security.scan',    category: 'SECURITY', description: 'Weekly dependency scan passed',                     severity: 'SUCCESS'                                         },
    { action: 'user.update',      category: 'USER',     description: 'Role elevated from VIEWER to MANAGER',              severity: 'WARNING', actorEmail: 'root@cryptogate.local' },
  ];

  for (const entry of activitySeed) {
    const actor = entry.actorEmail ? byEmail[entry.actorEmail] : null;
    await prisma.activityLog.create({
      data: {
        action: entry.action,
        category: entry.category,
        description: entry.description,
        severity: entry.severity,
        actorUserId: actor?.id ?? null,
        actorName: actor?.name ?? 'System',
        ipAddress: actor ? '10.0.0.12' : null,
      },
    });
  }
  console.log(`  ✓ ${activitySeed.length} activity entries`);

  console.log('✅ Seed complete.');
  console.log(`   Sign in with any seeded email / password: ${DEFAULT_PASSWORD}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
