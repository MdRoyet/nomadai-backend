import { Router } from 'express';
import { getCurrencies, convertCurrency } from '../controllers/currency.controller';

const router = Router();

router.get('/currencies', getCurrencies);
router.get('/convert', convertCurrency);

export default router;
