import express from 'express';
import dotenv from 'dotenv';
import path from 'path';


// Importar todas las rutas
import webhookRoutes from './src/routes/webhook.routes.js';
import apiRoutes from './src/routes/api.routes.js';
import * as metaService from './src/services/meta.service.js';

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


app.post('/api/bulk-send', async (req, res) => {
    const { templateName, recipients, language } = req.body;

    // 🚨 ESTO TE DIRÁ LA VERDAD EN LA CONSOLA DE NODE:
    console.log(`Intentando enviar: ${templateName} en idioma: [${language}] a ${recipients.length} números.`);

    if (!language) {
        return res.status(400).json({ error: "El idioma es obligatorio y no llegó al servidor." });
    }

    const results = [];
    for (const number of recipients) {
        try {
            // Pasamos el idioma detectado automáticamente
            const result = await metaService.sendTemplateMessage(number, templateName, language);
            results.push({ recipient: number, success: true, data: result });
        } catch (error) {
            // Si un número falla, guardamos el error y seguimos con el siguiente
            results.push({
                recipient: number,
                success: false,
                error: error.response?.data?.error || { message: error.message }
            });
        }
    }
    res.json({ message: 'Proceso de envío finalizado', results });
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
});