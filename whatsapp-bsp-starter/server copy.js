import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path'; // Importamos 'path' para rutas de archivos

// Cargar variables de entorno
dotenv.config(); 

const app = express();
// Usamos el puerto del .env o por defecto 4000
const PORT = process.env.PORT || 4000; 
const WABA_ID = process.env.WABA_ID;

// Middleware para parsear el cuerpo de las peticiones JSON
app.use(express.json());

// ----------------------------------------------------
// 🚨 AÑADIDO: Servir archivos estáticos (el Frontend)
// ----------------------------------------------------
// Esto permite que el navegador cargue index.html, CSS, y JavaScript
// Usa la sintaxis de __dirname para que funcione en cualquier entorno
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public'))); // Puedes poner tus archivos en una carpeta 'public'
app.get('/', (req, res) => {
    // Si acceden a la raíz, les servimos el archivo index.html
    res.sendFile(path.join(__dirname, 'index.html'));
});


// ----------------------------------------------------
// FUNCIÓN PARA ENVIAR PLANTILLAS (Existente, pero la mantenemos)
// ----------------------------------------------------
async function sendTemplateMessage(to, templateName, languageCode = "en_US") {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

    const data = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: languageCode
            }
        }
    };

    try {
        await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ Respuesta enviada (Plantilla) a ${to}: "${templateName}"`);
    } catch (error) {
        console.error("❌ Error al enviar plantilla a WhatsApp:", error.response ? error.response.data : error.message);
    }
}


// ----------------------------------------------------
// 🚨 NUEVA RUTA 1: OBTENER PLANTILLAS EXISTENTES (GET /api/templates)
// ----------------------------------------------------
app.get('/api/templates', async (req, res) => {
    const accessToken = process.env.META_ACCESS_TOKEN;
    // Usamos el ID de la Cuenta de WhatsApp Business (WABA ID) para listar plantillas
    // NOTA: El WABA ID lo puedes encontrar en tu panel de Meta Developers junto al Phone ID. 
    // Lo usaremos aquí como un valor hardcodeado hasta que lo añadas al .env
 
    const url = `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });
        // Devolvemos la lista de plantillas al Frontend
        res.status(200).json(response.data.data); 
    } catch (error) {
        console.error("Error al obtener plantillas de Meta:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Fallo al obtener plantillas de Meta API', details: error.message });
    }
});


// ----------------------------------------------------
// 🚨 NUEVA RUTA 2: CREAR Y ENVIAR PLANTILLA A APROBACIÓN (POST /api/templates)
// ----------------------------------------------------
app.post('/api/templates', async (req, res) => {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates`;
    
    // Datos recibidos del Frontend (req.body)
    const { name, category, language, body } = req.body; 

    // Estructura de la petición para crear una plantilla
    const templateData = {
        name: name,
        category: category,
        language: language,
        components: [
            {
                type: "BODY",
                text: body
            }
        ]
    };

    try {
        const response = await axios.post(url, templateData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        // La API de Meta devuelve 200 OK si el envío fue exitoso (pasa a estado PENDING)
        res.status(200).json({ message: 'Plantilla enviada a Meta para aprobación.', template: response.data });
    } catch (error) {
        console.error("Error al enviar plantilla a aprobación:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Fallo al crear plantilla', details: error.response ? error.response.data : error.message });
    }
});

// ----------------------------------------------------
// NUEVA RUTA 3: OBTENER CONFIGURACIÓN BÁSICA (GET /api/config)
// ----------------------------------------------------
app.get('/api/config', (req, res) => {
    // Solo enviamos los IDs y el WABA ID, no el Token de Acceso.
    res.status(200).json({
        phoneId: process.env.WHATSAPP_PHONE_ID,
        wabaId: WABA_ID
    });
});


// ----------------------------------------------------
// ENDPOINTS DE WHATSAPP (Se mantienen)
// ----------------------------------------------------

// 1. ENDPOINT PARA LA VERIFICACIÓN DEL WEBHOOK (GET)
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook Verificado con Éxito');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400); 
    }
});

// 2. ENDPOINT PARA RECIBIR MENSAJES (POST)
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'whatsapp_business_account') {
        body.entry.forEach(entry => {
            entry.changes.forEach(change => {
                if (change.field === 'messages') {
                    const messageData = change.value;

                    if (messageData.messages && messageData.messages[0]) {
                        const message = messageData.messages[0];
                        const from = message.from; 
                        const type = message.type; 

                        console.log(`Mensaje entrante de: ${from}`);

                        if (type === 'text') {
                            const text = message.text.body.toLowerCase();
                            console.log(`Contenido: ${text}`);
                            
                            // Respuesta con la plantilla 'hello_world'
                            sendTemplateMessage(from, 'hello_world'); 
                        } 
                    }
                }
            });
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404); 
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
});