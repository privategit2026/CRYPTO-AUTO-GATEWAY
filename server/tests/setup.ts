// Ensure Zod-validated env has values during tests.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test?schema=public';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-with-enough-length-1234567890';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-with-enough-length-1234567890';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? '8';
process.env.LOG_LEVEL = 'fatal';
