const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  clave: { type: String, required: true },
  direccion: String,
  coordenadas: {
    lat: Number,
    lng: Number
  },
  personalAsignado: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Personal' }],
  fotoFachada: String,
  descripcionServicio: String
});

module.exports = mongoose.model('Cliente', ClienteSchema);