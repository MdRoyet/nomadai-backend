import { Router } from 'express';
import { translateText, getSupportedLanguages } from '../controllers/translate.controller';

const router = Router();

router.post('/translate', translateText);
router.get('/languages', getSupportedLanguages);

export default router;
