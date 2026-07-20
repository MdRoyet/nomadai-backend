import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.5 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.12 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.97 },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', rate: 17.15 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.88 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 1325 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', rate: 35.2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rate: 3.75 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rate: 15680 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 30.2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.9 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1540 },
];

export const getCurrencies = asyncHandler(async (req: Request, res: Response) => {
  res.json({ currencies: CURRENCIES });
});

export const convertCurrency = asyncHandler(async (req: Request, res: Response) => {
  const { amount, from, to } = req.query;
  if (!amount || !from || !to) {
    return res.status(400).json({ message: 'amount, from, and to are required' });
  }

  const fromCurrency = CURRENCIES.find(c => c.code === String(from).toUpperCase());
  const toCurrency = CURRENCIES.find(c => c.code === String(to).toUpperCase());

  if (!fromCurrency || !toCurrency) {
    return res.status(400).json({ message: 'Invalid currency code' });
  }

  const usdAmount = Number(amount) / fromCurrency.rate;
  const converted = usdAmount * toCurrency.rate;

  res.json({
    from: fromCurrency,
    to: toCurrency,
    originalAmount: Number(amount),
    convertedAmount: Math.round(converted * 100) / 100,
    rate: toCurrency.rate / fromCurrency.rate,
  });
});
