import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Importar todas las rutas
import webhookRoutes from './src/routes/webhook.routes.js';
import apiRoutes from './src/routes/api.routes.js';

// Cargar variables de entorno
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 4000; 

// Middleware para parsear el cuerpo de las peticiones JSON
app.use(express.json());

// ----------------------------------------------------
// Configuración de Rutas Estáticas y del Frontend
// ----------------------------------------------------
const __dirname = path.resolve();

// Servir archivos estáticos (index.html, CSS, JS)
app.use(express.static(path.join(__dirname, 'public'))); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ----------------------------------------------------
// Carga de Módulos de Rutas
// ----------------------------------------------------

// Rutas del Webhook de WhatsApp: /webhook
app.use('/webhook', webhookRoutes);

// Rutas de la API para el Frontend: /api
app.use('/api', apiRoutes);


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
});