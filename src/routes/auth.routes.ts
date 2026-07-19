import { Router } from 'express';
import { registerUser, loginUser, demoLogin } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/demo', demoLogin);

export default router;
