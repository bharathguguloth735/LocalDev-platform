import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from "@aws-sdk/client-s3";
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize AWS S3 Client (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'YOUR_AWS_ACCESS_KEY_ID_HERE',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_AWS_SECRET_ACCESS_KEY_HERE',
  }
});

// Configure Multer to upload directly to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET || 'your-localdev-bucket-name',
    acl: null,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      console.log('🚀 Triggering S3 Upload for:', file.originalname);
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Create a unique file name
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'uploads/' + uniqueSuffix + '-' + file.originalname);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

// ── UPLOAD FILE ROUTE ──────────────────────────────────────────────────────────
router.post('/', verifyToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    // req.file contains the S3 location URL
    res.status(200).json({
      success: true,
      message: 'File successfully uploaded to AWS S3.',
      fileUrl: req.file.location, // The public URL of the uploaded file
      fileName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({ message: 'Error uploading file to storage.', error: error.message });
  }
});

export default router;
