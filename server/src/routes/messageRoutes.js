import { Router } from 'express';
import { getMessages, uploadFile } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/:roomId', protect, getMessages);
router.post('/upload', protect, upload.single('file'), uploadFile);

export default router;
