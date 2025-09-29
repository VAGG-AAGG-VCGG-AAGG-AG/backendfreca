const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000 // 30 segundos
    });
    console.log("Conexión exitosa a MongoDB Atlas");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error al conectar a MongoDB Atlas:", error);
  }
}

testConnection();