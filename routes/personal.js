const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Personal = require('../models/Personal');

const router = express.Router();

// Configuración de almacenamiento para fotos de perfil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/perfiles/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Crear personal
router.post('/', upload.single('fotoPerfil'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (data.clienteAsignado === '') delete data.clienteAsignado;
    const fotoPerfil = req.file ? `/uploads/perfiles/${req.file.filename}` : '';
    const nuevoPersonal = new Personal({ ...data, fotoPerfil });
    await nuevoPersonal.save();
    res.status(201).json(nuevoPersonal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar personal
router.get('/', async (req, res) => {
  try {
    const personal = await Personal.find().populate('clienteAsignado');
    res.json(personal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar personal
router.put('/:id', upload.single('fotoPerfil'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (data.clienteAsignado === '') delete data.clienteAsignado;
    let update = { ...data };
    if (req.file) {
      update.fotoPerfil = `/uploads/perfiles/${req.file.filename}`;
      // Eliminar foto anterior si existe
      const old = await Personal.findById(req.params.id);
      if (old && old.fotoPerfil && fs.existsSync('.' + old.fotoPerfil)) {
        fs.unlinkSync('.' + old.fotoPerfil);
      }
    }
    const updated = await Personal.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar personal
router.delete('/:id', async (req, res) => {
  try {
    const personal = await Personal.findByIdAndDelete(req.params.id);
    if (personal && personal.fotoPerfil && fs.existsSync('.' + personal.fotoPerfil)) {
      fs.unlinkSync('.' + personal.fotoPerfil);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
