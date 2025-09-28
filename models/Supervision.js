const mongoose = require('mongoose');

const SupervisionesSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  personal: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Personal' }],
  fecha: { type: Date, default: Date.now },
  checklist: [String],
  novedades: String,
  solicitudes: String,
  fotos: [String],
  observaciones: String,
  supervisor: String
});

module.exports = mongoose.model('Supervision', SupervisionesSchema);