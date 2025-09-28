const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/logo/');
  },
  filename: function (req, file, cb) {
    cb(null, 'logo' + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
  res.json({ url: `/uploads/logo/${req.file.filename}` });
});

router.get('/', (req, res) => {
  const fs = require('fs');
  const dir = 'uploads/logo/';
  const files = fs.readdirSync(dir).filter(f => f.startsWith('logo'));
  if (files.length) {
    res.json({ url: `/uploads/logo/${files[0]}` });
  } else {
    res.json({ url: null });
  }
});

module.exports = router;
