import { Router } from 'express';
import { matchDestinations, getQuizQuestions } from '../controllers/matcher.controller';

const router = Router();

router.post('/match', matchDestinations);
router.get('/quiz', getQuizQuestions);

export default router;
