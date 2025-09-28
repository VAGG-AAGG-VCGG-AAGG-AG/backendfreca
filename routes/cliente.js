const express = require('express');
const multer = require('multer');
const path = require('path');
const Cliente = require('../models/Cliente');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/fachadas/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Crear cliente
router.post('/', upload.single('fotoFachada'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const fotoFachada = req.file ? `/uploads/fachadas/${req.file.filename}` : '';
    const nuevoCliente = new Cliente({ ...data, fotoFachada });
    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().populate('personalAsignado');
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar cliente
router.put('/:id', upload.single('fotoFachada'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    let update = { ...data };
    if (req.file) {
      update.fotoFachada = `/uploads/fachadas/${req.file.filename}`;
    }
    const updated = await Cliente.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
