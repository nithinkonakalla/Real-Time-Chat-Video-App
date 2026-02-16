import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { env } from '../config/env.js';

const uploadPath = path.resolve(env.uploadDir);
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  }
});

export const upload = multer({ storage });
