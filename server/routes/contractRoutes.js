const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getContracts, getContract, uploadContract, deleteContract } = require('../controllers/contractController');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/contracts');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// POST /api/contracts/upload — Upload contract PDF (must be before /:contractId)
router.post('/upload', upload.single('contract'), uploadContract);

// GET /api/contracts/:companyId — All uploaded contracts
router.get('/:companyId', getContracts);

// GET /api/contracts/:contractId — Single contract with parsed data
router.get('/detail/:contractId', getContract);

// DELETE /api/contracts/:contractId — Remove a contract
router.delete('/:contractId', deleteContract);

module.exports = router;
