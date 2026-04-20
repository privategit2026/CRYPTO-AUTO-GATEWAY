export type DisplayCurrency = 'USD' | 'USDT' | 'BDT';

export interface AppSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    timezone: string;
    displayCurrency: DisplayCurrency;
  };
  payments: {
    minDeposit: number;
    maxDeposit: number;
    depositTimeout: number;
    autoConfirm: boolean;
    callbackRetries: number;
  };
  networks: {
    trc20Enabled: boolean;
    trc20Confirmations: number;
    trc20Fee: number;
    erc20Enabled: boolean;
    erc20Confirmations: number;
    erc20Fee: number;
    bep20Enabled: boolean;
    bep20Confirmations: number;
    bep20Fee: number;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    ipWhitelist: string;
    maxLoginAttempts: number;
    rateLimitPerMinute: number;
  };
}

export const defaultAppSettings: AppSettings = {
  general: {
    siteName: 'CryptoGate',
    siteUrl: 'https://cryptogate.io',
    supportEmail: 'support@cryptogate.io',
    timezone: 'UTC',
    displayCurrency: 'USD',
  },
  payments: {
    minDeposit: 1,
    maxDeposit: 100000,
    depositTimeout: 30,
    autoConfirm: true,
    callbackRetries: 3,
  },
  networks: {
    trc20Enabled: true,
    trc20Confirmations: 20,
    trc20Fee: 1.0,
    erc20Enabled: true,
    erc20Confirmations: 12,
    erc20Fee: 5.5,
    bep20Enabled: true,
    bep20Confirmations: 15,
    bep20Fee: 0.3,
  },
  security: {
    twoFactorRequired: false,
    sessionTimeout: 60,
    ipWhitelist: '',
    maxLoginAttempts: 5,
    rateLimitPerMinute: 60,
  },
};

const STORAGE_KEY = 'cryptogate_admin_settings_v1';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const loadAppSettings = (): AppSettings => {
  if (!canUseStorage()) return defaultAppSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;

    // Best-effort merge with defaults to keep forward compatibility.
    return {
      ...defaultAppSettings,
      ...parsed,
      general: { ...defaultAppSettings.general, ...parsed.general },
      payments: { ...defaultAppSettings.payments, ...parsed.payments },
      networks: { ...defaultAppSettings.networks, ...parsed.networks },
      security: { ...defaultAppSettings.security, ...parsed.security },
    };
  } catch {
    return defaultAppSettings;
  }
};

export const saveAppSettings = (settings: AppSettings) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota / privacy mode errors.
  }
};

