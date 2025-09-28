const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  serial: String,
  marca: String,
  modelo: String
});

const PersonalSchema = new mongoose.Schema({
  nombreApellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  direccion: String,
  fotoPerfil: String, // URL del archivo subido
  jornada: {
    type: String,
    enum: [
      '12x12 diurno', '12x12 nocturno', '24x24', '24x48',
      '24x24x72', '48x48', '6 a 11 Especial mixto'
    ]
  },
  clienteAsignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  cargo: {
    type: String,
    enum: [
      'oficial de seguridad', 'supervisor de seguridad', 'técnico de seguridad',
      'operador cctv', 'centralista de comunicaciones', 'operador de monitores',
      'coordinador de operaciones', 'personal de mantenimiento', 'escoltas vip',
      'seguridad eventos especiales'
    ]
  },
  equipos: [EquipoSchema]
});

module.exports = mongoose.model('Personal', PersonalSchema);