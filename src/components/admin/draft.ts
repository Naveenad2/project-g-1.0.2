/**
 * The pricing form: what each field is, how its text is read, and the checks that run before anything is
 * published. The same limits are enforced again on the server by the database rules.
 */
import { CURRENCIES, LIMITS, formatPercent, formatPrice, savingOf, type PricingValues } from '@/lib/pricing';

export const FIELDS = ['currency', 'annualSaving', 'starterMonthly', 'starterAnnual', 'seatCap', 'proMonthly', 'proAnnual'] as const;
export type FieldKey = (typeof FIELDS)[number];
export type Draft = Record<FieldKey, string>;

export const LABELS: Record<FieldKey, string> = {
  currency: 'Currency',
  annualSaving: 'Saving shown on the switch',
  starterMonthly: 'Starter, billed monthly',
  starterAnnual: 'Starter, billed annually',
  seatCap: 'Starter user limit',
  proMonthly: 'Professional, billed monthly',
  proAnnual: 'Professional, billed annually',
};

const PRICE = /^\d{1,8}(\.\d{1,2})?$/;
const WHOLE = /^\d{1,7}$/;
const PERCENT = /^\d{1,2}(\.\d)?$/;

export const EMPTY: Draft = {
  currency: 'USD',
  annualSaving: '15',
  starterMonthly: '',
  starterAnnual: '',
  seatCap: '',
  proMonthly: '',
  proAnnual: '',
};

export function toDraft(v: PricingValues | null): Draft {
  if (!v) return { ...EMPTY };
  return {
    currency: v.currency,
    annualSaving: String(v.annualSaving),
    starterMonthly: String(v.starter.monthly),
    starterAnnual: String(v.starter.annual),
    seatCap: String(v.starter.seatCap),
    proMonthly: String(v.professional.monthly),
    proAnnual: String(v.professional.annual),
  };
}

/** Field text → number, or the reason it cannot be used. */
function read(key: FieldKey, raw: string): { value?: number; error?: string } {
  const text = raw.trim();
  if (!text) return { error: 'Required' };
  if (key === 'seatCap') {
    if (!WHOLE.test(text)) return { error: 'Whole number of users, e.g. 25' };
    const n = Number(text);
    return n >= 1 && n <= LIMITS.seats ? { value: n } : { error: `Between 1 and ${LIMITS.seats.toLocaleString('en-US')}` };
  }
  if (key === 'annualSaving') {
    if (!PERCENT.test(text)) return { error: 'A percentage like 15 or 12.5' };
    const n = Number(text);
    return n <= LIMITS.saving ? { value: n } : { error: `At most ${LIMITS.saving}%` };
  }
  if (!PRICE.test(text)) return { error: 'Digits with up to two decimals, e.g. 49 or 49.50' };
  const n = Number(text);
  return n <= LIMITS.price ? { value: n } : { error: 'That is higher than any price allowed' };
}

export interface Checked {
  values: PricingValues | null;
  errors: Partial<Record<FieldKey, string>>;
  /** Things worth a second look that do not stop publishing. */
  warnings: string[];
}

export function check(d: Draft): Checked {
  const errors: Partial<Record<FieldKey, string>> = {};
  const n: Partial<Record<FieldKey, number>> = {};
  for (const key of FIELDS) {
    if (key === 'currency') continue;
    const r = read(key, d[key]);
    if (r.error) errors[key] = r.error;
    else n[key] = r.value;
  }
  if (!CURRENCIES.some((c) => c.code === d.currency)) errors.currency = 'Choose a currency';
  if (Object.keys(errors).length) return { values: null, errors, warnings: [] };

  const values: PricingValues = {
    currency: d.currency,
    annualSaving: n.annualSaving!,
    starter: { monthly: n.starterMonthly!, annual: n.starterAnnual!, seatCap: n.seatCap! },
    professional: { monthly: n.proMonthly!, annual: n.proAnnual! },
  };
  const warnings: string[] = [];
  for (const [name, t] of [
    ['Starter', values.starter],
    ['Professional', values.professional],
  ] as const) {
    if (t.annual > t.monthly) warnings.push(`${name}: the annual price is higher than the monthly price.`);
    const saving = savingOf(t);
    if (saving !== null && t.annual <= t.monthly && Math.abs(saving - values.annualSaving) >= 0.5)
      warnings.push(
        `${name}: annual is ${formatPercent(saving)}% below monthly, but the switch says “save ${formatPercent(values.annualSaving)}%”.`,
      );
  }
  return { values, errors, warnings };
}

/** A field's value as people read it: "$49", "25 users", "15%". */
export function show(key: FieldKey, raw: string, currency: string): string {
  const text = raw.trim();
  if (!text) return '—';
  if (key === 'currency') return text;
  if (key === 'annualSaving') return `${text}%`;
  if (key === 'seatCap') return `${Number(text).toLocaleString('en-US')} users`;
  return Number.isFinite(Number(text)) ? formatPrice(Number(text), currency) : text;
}

export interface Change {
  key: FieldKey;
  before: string;
  after: string;
}

/**
 * What publishing would change, field by field, as people read the values (so a new currency shows on every
 * price). With nothing published yet, every field is new.
 */
export function changes(from: Draft | null, to: Draft): Change[] {
  return FIELDS.map((key) => ({
    key,
    before: from ? show(key, from[key], from.currency) : '—',
    after: show(key, to[key], to.currency),
  })).filter((c) => !from || c.before !== c.after);
}
