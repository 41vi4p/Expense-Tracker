import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';

export const MAX_AMOUNT = 1_000_000_000;
export const MAX_DESCRIPTION = 200;
export const MAX_IMPORT_ROWS = 5000;
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

const ALL_CATEGORY_IDS = new Set(
  [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => c.id)
);

export interface ValidTransactionInput {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
}

/** Strip control characters and clamp length. React already escapes output; this keeps stored data clean. */
export const sanitizeText = (value: unknown, max: number): string =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);

/** Returns a cleaned transaction or throws an Error with a user-readable message. */
export const validateTransaction = (input: Record<string, any>): ValidTransactionInput => {
  const type = input.type;
  if (type !== 'income' && type !== 'expense') throw new Error('Invalid transaction type');

  const amount = typeof input.amount === 'string' ? Number(input.amount) : input.amount;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    throw new Error('Amount must be a positive number');
  }

  const description = sanitizeText(input.description, MAX_DESCRIPTION);
  if (!description) throw new Error('Description is required');

  const category = String(input.category ?? '');
  if (!ALL_CATEGORY_IDS.has(category)) throw new Error('Invalid category');

  const date = input.date instanceof Date ? input.date : new Date(input.date);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date');

  return { type, amount: Math.round(amount * 100) / 100, description, category, date };
};
