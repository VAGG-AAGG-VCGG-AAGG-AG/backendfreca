// Backend entry point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado')).catch(err => console.error('Error MongoDB:', err));

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando' });
});

// Usuarios fijos
const USERS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    username: 'monitor',
    password: 'monitor123',
    role: 'monitor',
    name: 'Monitor'
  },
  {
    username: 'operaciones',
    password: 'operaciones123',
    role: 'operaciones',
    name: 'Operaciones'
  }
];

// Endpoint de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ username: user.username, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, role: user.role, name: user.name });
});

// Middleware de autenticación
function auth(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'No autorizado' });
      }
      next();
    } catch {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
}

// Ruta protegida de prueba
app.get('/api/protegido', auth(['admin', 'operaciones']), (req, res) => {
  res.json({ message: `Hola ${req.user.name}, tienes acceso a esta ruta protegida como ${req.user.role}` });
});

// Rutas de personal
const personalRoutes = require('./routes/personal');
const clienteRoutes = require('./routes/cliente');
const supervisionRoutes = require('./routes/supervision');
const logoRoutes = require('./routes/logo');
app.use('/api/personal', personalRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/supervisiones', supervisionRoutes);
app.use('/api/logo', logoRoutes);

// Endpoint de estadísticas
app.get('/api/estadisticas', async (req, res) => {
  try {
    const Personal = require('./models/Personal');
    const Cliente = require('./models/Cliente');
    const Supervision = require('./models/Supervision');
    const totalPersonal = await Personal.countDocuments();
    const totalClientes = await Cliente.countDocuments();
    const personalPorCargoArr = await Personal.aggregate([
      { $group: { _id: '$cargo', cantidad: { $sum: 1 } } }
    ]);
    const personalPorCargo = {};
    personalPorCargoArr.forEach(p => { personalPorCargo[p._id] = p.cantidad; });
    const clientes = await Cliente.find();
    const clientesPorPersonal = {};
    clientes.forEach(c => {
      const cant = c.personalAsignado?.length || 0;
      clientesPorPersonal[cant] = (clientesPorPersonal[cant] || 0) + 1;
    });
    // Clientes visitados por supervisor
    const supervisiones = await Supervision.find();
    const clientesVisitadosPorSupervisor = {};
    supervisiones.forEach(s => {
      if (s.supervisor && s.cliente) {
        clientesVisitadosPorSupervisor[s.supervisor] = (clientesVisitadosPorSupervisor[s.supervisor] || 0) + 1;
      }
    });
    res.json({ totalPersonal, totalClientes, personalPorCargo, clientesPorPersonal, clientesVisitadosPorSupervisor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://0.0.0.0:${PORT}`);
});
