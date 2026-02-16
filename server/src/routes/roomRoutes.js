import { Router } from 'express';
import { createDirectRoom, createGroupRoom, getMyRooms } from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getMyRooms);
router.post('/direct', protect, createDirectRoom);
router.post('/group', protect, createGroupRoom);

export default router;
