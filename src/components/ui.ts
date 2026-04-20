import type { DisplayCurrency } from '../store/appSettings';

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

// FX helpers (frontend-only mock): 1 USDT = 125 BDT (Taka)
export const USDT_TO_BDT_RATE = 125;

export const usdtToBdt = (usdt: number, rate: number = USDT_TO_BDT_RATE) => usdt * rate;

export const bdtToUsdt = (bdt: number, rate: number = USDT_TO_BDT_RATE) => bdt / rate;

const formatNumber = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

// Amount formatting for UI: treat base values as USDT-denominated unless overridden by a real backend later.
export const formatAmount = (amountUsdt: number, displayCurrency: DisplayCurrency) => {
  if (displayCurrency === 'BDT') {
    const bdt = usdtToBdt(amountUsdt);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: bdt % 1 === 0 ? 0 : 2,
    }).format(bdt);
  }

  if (displayCurrency === 'USD') {
    return currency(amountUsdt);
  }

  return `${formatNumber(amountUsdt)} USDT`;
};

export const shortAddress = (value: string, start = 8, end = 6) => {
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
};

export const today = () => new Date().toISOString().slice(0, 10);
