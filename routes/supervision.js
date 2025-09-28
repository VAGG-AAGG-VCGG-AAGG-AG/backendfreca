const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Supervision = require('../models/Supervision');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/supervisiones/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Crear supervision
router.post('/', upload.array('fotos', 5), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const fotos = req.files ? req.files.map(f => `/uploads/supervisiones/${f.filename}`) : [];
    const nueva = new Supervision({ ...data, fotos });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar supervisiones
router.get('/', async (req, res) => {
  try {
    const supervisiones = await Supervision.find().populate('cliente').populate('personal');
    res.json(supervisiones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar supervision
router.delete('/:id', async (req, res) => {
  try {
    const supervision = await Supervision.findByIdAndDelete(req.params.id);
    if (supervision && supervision.fotos) {
      supervision.fotos.forEach(f => {
        if (fs.existsSync('.' + f)) fs.unlinkSync('.' + f);
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
