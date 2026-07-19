import { Router } from 'express';
import { registerUser, loginUser, demoLogin } from '../controllers/auth.controller';
import { googleAuth } from '../controllers/googleAuth.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/demo', demoLogin);
router.post('/google', googleAuth);

export default router;
