/**
 * Development seed — aligns loosely with `src/mock/*` demo data.
 * Run: `npx prisma db seed` (requires `DATABASE_URL` and `prisma migrate` / `db push`).
 */
import { createHash } from 'node:crypto';
import {
  PrismaClient,
  type CryptoNetwork,
  type DepositStatus,
  type UserRole,
  type UserStatus,
  type WalletStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

async function main() {
  await prisma.$transaction([
    prisma.activityLog.deleteMany(),
    prisma.deposit.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const usersData: Array<{
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    companyName?: string;
  }> = [
    { email: 'alice@cryptogate.local', name: 'Alice Johnson', role: 'ADMIN', status: 'ACTIVE', companyName: 'CryptoGate' },
    { email: 'bob@merchantdesk.local', name: 'Bob Smith', role: 'MANAGER', status: 'ACTIVE', companyName: 'MerchantDesk' },
    { email: 'carol@merchantdesk.local', name: 'Carol White', role: 'VIEWER', status: 'ACTIVE', companyName: 'MerchantDesk' },
    { email: 'david@partnerpay.local', name: 'David Brown', role: 'VIEWER', status: 'INACTIVE', companyName: 'PartnerPay' },
    { email: 'eve@partnerpay.local', name: 'Eve Davis', role: 'MANAGER', status: 'ACTIVE', companyName: 'PartnerPay' },
    { email: 'frank@cryptogate.local', name: 'Frank Miller', role: 'ADMIN', status: 'ACTIVE', companyName: 'CryptoGate' },
    { email: 'grace@digitalgoods.local', name: 'Grace Lee', role: 'VIEWER', status: 'ACTIVE', companyName: 'Digital Goods Inc' },
    { email: 'henry@digitalgoods.local', name: 'Henry Wilson', role: 'VIEWER', status: 'INACTIVE', companyName: 'Digital Goods Inc' },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role,
          status: u.status,
          companyName: u.companyName,
        },
      }),
    ),
  );

  const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));

  const walletsData: Array<{
    email: string;
    address: string;
    network: CryptoNetwork;
    status: WalletStatus;
  }> = [
    { email: 'alice@cryptogate.local', address: 'tq9zn7a3zuqv6xf2mw8rh4nkce5pr1abd', network: 'TRC20', status: 'USED' },
    { email: 'bob@merchantdesk.local', address: 'ty8mbtr7nlwkzx9ebtqj6bdbqwmwed4rtp', network: 'TRC20', status: 'ACTIVE' },
    { email: 'carol@merchantdesk.local', address: '0x63e7129d83460f431f3f8f31b0d5d7b24fe214d8', network: 'ERC20', status: 'ACTIVE' },
    { email: 'eve@partnerpay.local', address: '0xa6dc4f5079bb389f24673247659fbb76d2752b4e', network: 'BEP20', status: 'ACTIVE' },
    { email: 'david@partnerpay.local', address: 'tg5cg1o8q1r9yzqt7vv2uakpw8qcnr44xs', network: 'TRC20', status: 'USED' },
    { email: 'grace@digitalgoods.local', address: '0x87f23394324d0789d7cb4c6f85b94af0cb682c92', network: 'ERC20', status: 'INACTIVE' },
    { email: 'henry@digitalgoods.local', address: '0xcc1e70a33a755ccbcbff812a1af21f36764a1747', network: 'BEP20', status: 'ACTIVE' },
  ];

  const wallets = await Promise.all(
    walletsData.map((w) =>
      prisma.wallet.create({
        data: {
          userId: byEmail[w.email]!.id,
          address: w.address,
          network: w.network,
          status: w.status,
        },
      }),
    ),
  );

  const walletKey = (network: CryptoNetwork, address: string) =>
    `${network}:${address.toLowerCase()}`;
  const walletByNetAddr = Object.fromEntries(
    wallets.map((wal) => [walletKey(wal.network, wal.address), wal]),
  );

  const depositsData: Array<{
    email: string;
    amount: string;
    network: CryptoNetwork;
    toAddress: string;
    txHash: string;
    status: DepositStatus;
    wallet?: { network: CryptoNetwork; address: string };
  }> = [
    {
      email: 'alice@cryptogate.local',
      amount: '500',
      network: 'TRC20',
      toAddress: 'tq9zn7a3zuqv6xf2mw8rh4nkce5pr1abd',
      txHash: '7f3c2e91a0bb41c99edc811d33a2e2d47b3a91e06f9d5bb67dc13ec04d2a9072',
      status: 'COMPLETED',
      wallet: { network: 'TRC20', address: 'tq9zn7a3zuqv6xf2mw8rh4nkce5pr1abd' },
    },
    {
      email: 'bob@merchantdesk.local',
      amount: '1200',
      network: 'TRC20',
      toAddress: 'ty8mbtr7nlwkzx9ebtqj6bdbqwmwed4rtp',
      txHash: 'b7ac351c89a94ea5ab3f7d0f8d152c216d904d640214bc928a9d9e534f433f12',
      status: 'PENDING',
      wallet: { network: 'TRC20', address: 'ty8mbtr7nlwkzx9ebtqj6bdbqwmwed4rtp' },
    },
    {
      email: 'carol@merchantdesk.local',
      amount: '250',
      network: 'ERC20',
      toAddress: '0x63e7129d83460f431f3f8f31b0d5d7b24fe214d8',
      txHash: '0x42f89ee3f6d12f001b6cf6dcb2128b9308d9ad56bff7c8a75f83d8e504aaf916',
      status: 'DETECTED',
      wallet: { network: 'ERC20', address: '0x63e7129d83460f431f3f8f31b0d5d7b24fe214d8' },
    },
    {
      email: 'david@partnerpay.local',
      amount: '3000',
      network: 'TRC20',
      toAddress: 'tg5cg1o8q1r9yzqt7vv2uakpw8qcnr44xs',
      txHash: '9ef614ca8c3f4b55b6b4d56be014e011890bb0bd5e191a4fe2c47d231d638d2a',
      status: 'CONFIRMING',
      wallet: { network: 'TRC20', address: 'tg5cg1o8q1r9yzqt7vv2uakpw8qcnr44xs' },
    },
    {
      email: 'eve@partnerpay.local',
      amount: '750',
      network: 'BEP20',
      toAddress: '0xa6dc4f5079bb389f24673247659fbb76d2752b4e',
      txHash: '0x653c8f676c49494aeaf7f208f1f0172a354ce887fd14753eca88e6fc41a5d7e2',
      status: 'PENDING',
      wallet: { network: 'BEP20', address: '0xa6dc4f5079bb389f24673247659fbb76d2752b4e' },
    },
    {
      email: 'frank@cryptogate.local',
      amount: '100',
      network: 'TRC20',
      toAddress: 'tnm7wwqp24s8bbtv7bhmj4jq4kpxfy2eam',
      txHash: '127d67cd65054c068b0b3a532488042f582d3260e3451a0c087c99ca81a90f8b',
      status: 'COMPLETED',
    },
    {
      email: 'grace@digitalgoods.local',
      amount: '2500',
      network: 'ERC20',
      toAddress: '0x87f23394324d0789d7cb4c6f85b94af0cb682c92',
      txHash: '0xaab04f5e9b604355879e97a31cc260789a7a9d0c53c80c47ca60637b363fe33d',
      status: 'COMPLETED',
      wallet: { network: 'ERC20', address: '0x87f23394324d0789d7cb4c6f85b94af0cb682c92' },
    },
    {
      email: 'henry@digitalgoods.local',
      amount: '800',
      network: 'BEP20',
      toAddress: '0xcc1e70a33a755ccbcbff812a1af21f36764a1747',
      txHash: '0xbb728ad494f4c6e1843271dc78346fc9d31a3d24589f10a68eb01d515b928022',
      status: 'PENDING',
      wallet: { network: 'BEP20', address: '0xcc1e70a33a755ccbcbff812a1af21f36764a1747' },
    },
  ];

  for (const d of depositsData) {
    const user = byEmail[d.email]!;
    const w =
      d.wallet != null ? walletByNetAddr[walletKey(d.wallet.network, d.wallet.address)] : undefined;
    await prisma.deposit.create({
      data: {
        userId: user.id,
        walletId: w?.id,
        amount: d.amount,
        assetSymbol: 'USDT',
        network: d.network,
        toAddress: d.toAddress,
        txHash: d.txHash,
        status: d.status,
        confirmations: d.status === 'COMPLETED' ? 20 : 0,
        requiredConfirmations: d.network === 'TRC20' ? 19 : 12,
      },
    });
  }

  const apiSeed = [
    {
      email: 'grace@digitalgoods.local',
      name: 'Production Key',
      keyPrefix: 'pk_live_TRX9xAb1Cd2Ef3Gh4',
      keySecret: 'pk_secret_prod_1',
      permissions: ['READ', 'WRITE', 'WEBHOOKS'] as const,
      status: 'ACTIVE' as const,
    },
    {
      email: 'bob@merchantdesk.local',
      name: 'Test Key',
      keyPrefix: 'pk_test_7yCd2Ef3Gh4Ij5Kl',
      keySecret: 'pk_secret_test_1',
      permissions: ['READ', 'WRITE'] as const,
      status: 'ACTIVE' as const,
    },
  ];

  for (const k of apiSeed) {
    const user = byEmail[k.email]!;
    await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        keyHash: sha256(`apikey:${k.keyPrefix}`),
        secretHash: sha256(`secret:${k.keySecret}`),
        permissions: [...k.permissions],
        status: k.status,
        rateLimitPerMin: 5000,
        requestsToday: 0,
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      action: 'Seed Completed',
      category: 'SYSTEM',
      description: 'Database seeded with demo users, wallets, deposits, and API keys.',
      severity: 'SUCCESS',
      actorLabel: 'System',
    },
  });

  console.log(
    `Seed OK: ${users.length} users, ${wallets.length} wallets, ${depositsData.length} deposits, ${apiSeed.length} API keys.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
