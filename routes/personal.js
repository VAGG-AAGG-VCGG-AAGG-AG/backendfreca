const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const s3 = new AWS.S3({
  region: 'us-east-1' // Cambiar según la región
});
const Personal = require('../models/Personal');
const Cliente = require('../models/Cliente');

const router = express.Router();

// Configuraci�n de almacenamiento para fotos de perfil
const storage = multerS3({
  s3: s3,
  bucket: 'nombre-del-bucket', // Cambiar por el nombre del bucket
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    cb(null, `perfiles/${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// Crear personal
router.post('/', upload.single('fotoPerfil'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (data.clienteAsignado === '') delete data.clienteAsignado;
    const fotoPerfil = req.file ? req.file.location : '';
    const nuevoPersonal = new Personal({ ...data, fotoPerfil });
    await nuevoPersonal.save();
    // Actualizar modelo Cliente: agregar personalAsignado
    if (nuevoPersonal.clienteAsignado) {
      await Cliente.findByIdAndUpdate(
        nuevoPersonal.clienteAsignado,
        { $addToSet: { personalAsignado: nuevoPersonal._id } }
      );
    }
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
      update.fotoPerfil = req.file.location;
      // Eliminar foto anterior si existe
      const old = await Personal.findById(req.params.id);
      if (old && old.fotoPerfil && fs.existsSync('.' + old.fotoPerfil)) {
        fs.unlinkSync('.' + old.fotoPerfil);
      }
    }
    const oldPersonal = await Personal.findById(req.params.id);
    const updated = await Personal.findByIdAndUpdate(req.params.id, update, { new: true });
    // Si cambi� el cliente asignado, actualizar ambos modelos
    if (oldPersonal && oldPersonal.clienteAsignado && (!updated.clienteAsignado || updated.clienteAsignado.toString() !== oldPersonal.clienteAsignado.toString())) {
      // Quitar de cliente anterior
      await Cliente.findByIdAndUpdate(
        oldPersonal.clienteAsignado,
        { $pull: { personalAsignado: updated._id } }
      );
    }
    if (updated.clienteAsignado) {
      await Cliente.findByIdAndUpdate(
        updated.clienteAsignado,
        { $addToSet: { personalAsignado: updated._id } }
      );
    }
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
      // Aquí no se elimina el archivo de S3 automáticamente
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
