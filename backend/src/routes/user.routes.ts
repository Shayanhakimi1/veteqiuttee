import { Router } from 'express';
import { registerUser, adminLogin } from '../controllers/user.controller';

const router = Router();

router.post('/auth/register', registerUser);
router.post('/admin/login', adminLogin);

export default router;