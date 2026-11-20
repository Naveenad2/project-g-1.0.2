/**
 * Prices for the pricing page, kept in the Realtime Database at `/pricing` and edited in the pricing admin.
 * The same checks run in the browser (here) and on the server (`database.rules.json`), so the page only ever
 * shows prices that are complete and sensible.
 */
import { database } from './firebase';

export interface TierPrice {
  /** Price per user per month when billed monthly. */
  monthly: number;
  /** Price per user per month when billed annually. */
  annual: number;
}

export interface PricingValues {
  /** ISO 4217 code, e.g. USD. */
  currency: string;
  /** The saving shown on the billing switch: "Annual · save 15%". */
  annualSaving: number;
  starter: TierPrice & {
    /** "up to N users" under the Starter tier. */
    seatCap: number;
  };
  professional: TierPrice;
}

export interface Pricing extends PricingValues {
  updatedAt?: number;
  updatedBy?: string;
}

export const CURRENCIES: { code: string; name: string }[] = [
  { code: 'USD', name: 'US dollar' },
  { code: 'INR', name: 'Indian rupee' },
  { code: 'AED', name: 'UAE dirham' },
  { code: 'SAR', name: 'Saudi riyal' },
  { code: 'QAR', name: 'Qatari riyal' },
  { code: 'BHD', name: 'Bahraini dinar' },
  { code: 'KWD', name: 'Kuwaiti dinar' },
  { code: 'OMR', name: 'Omani rial' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'SGD', name: 'Singapore dollar' },
];

/** The copy's saving when no prices have been published yet. */
export const DEFAULT_SAVING = 15;

export const LIMITS = {
  price: 10_000_000,
  seats: 1_000_000,
  saving: 90,
};

const isNum = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

const tier = (raw: unknown): TierPrice | null => {
  if (!raw || typeof raw !== 'object') return null;
  const { monthly, annual } = raw as Record<string, unknown>;
  return isNum(monthly, 0, LIMITS.price) && isNum(annual, 0, LIMITS.price) ? { monthly, annual } : null;
};

/** Accepts only a complete, valid set of prices; anything else is treated as "no prices yet". */
export function parsePricing(raw: unknown): Pricing | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const starter = tier(r.starter);
  const professional = tier(r.professional);
  const seatCap = (r.starter as Record<string, unknown> | undefined)?.seatCap;
  if (!starter || !professional) return null;
  if (!isNum(seatCap, 1, LIMITS.seats) || !Number.isInteger(seatCap)) return null;
  if (typeof r.currency !== 'string' || !/^[A-Z]{3}$/.test(r.currency)) return null;
  if (!isNum(r.annualSaving, 0, LIMITS.saving)) return null;
  return {
    currency: r.currency,
    annualSaving: r.annualSaving,
    starter: { ...starter, seatCap },
    professional,
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : undefined,
    updatedBy: typeof r.updatedBy === 'string' ? r.updatedBy : undefined,
  };
}

/** Just the values (without who and when), as stored in the history and compared in the admin. */
export function valuesOf(p: PricingValues): PricingValues {
  return {
    currency: p.currency,
    annualSaving: p.annualSaving,
    starter: { monthly: p.starter.monthly, annual: p.starter.annual, seatCap: p.starter.seatCap },
    professional: { monthly: p.professional.monthly, annual: p.professional.annual },
  };
}

/** "$49", "₹3,999", "AED 99"; decimals only when the price has them. */
export function formatPrice(amount: number, currency: string): string {
  const whole = Number.isInteger(amount);
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/** "15" or "12.5" */
export function formatPercent(n: number): string {
  return Number.isInteger(n) ? `${n}` : `${Math.round(n * 10) / 10}`;
}

/** How much lower the annual price is than the monthly one, in percent. */
export function savingOf(t: TierPrice): number | null {
  return t.monthly > 0 ? ((t.monthly - t.annual) / t.monthly) * 100 : null;
}

/**
 * Follow the published prices: called with the prices now and again whenever they change,
 * or with null when none have been published. Returns a function that stops listening.
 */
export function subscribePricing(onPricing: (pricing: Pricing | null) => void, onError: (error: Error) => void): () => void {
  let stop: (() => void) | null = null;
  let cancelled = false;
  Promise.all([database(), import('firebase/database')])
    .then(([db, { ref, onValue }]) => {
      if (cancelled) return;
      stop = onValue(
        ref(db, 'pricing'),
        (snap) => onPricing(parsePricing(snap.val())),
        (error) => onError(error),
      );
    })
    .catch((error: unknown) => onError(error instanceof Error ? error : new Error(String(error))));
  return () => {
    cancelled = true;
    stop?.();
  };
}
