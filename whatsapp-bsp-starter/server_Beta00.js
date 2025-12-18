import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios'; // Importamos axios para hacer peticiones HTTP

// Cargar variables de entorno del archivo .env
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de las peticiones JSON
app.use(express.json());

// ----------------------------------------------------
// FUNCIÓN PARA ENVIAR MENSAJES
// ----------------------------------------------------
async function sendMessage(to, text) {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

    // Cuerpo del mensaje que cumple con el formato de la API de WhatsApp
    const data = {
        messaging_product: "whatsapp",
        to: to, // El número del destinatario (el 'from' del mensaje entrante)
        type: "text",
        text: {
            body: text
        }
    };

    try {
        await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Respuesta enviada a ${to}: "${text}"`);
    } catch (error) {
        console.error("Error al enviar mensaje a WhatsApp:", error.response ? error.response.data : error.message);
    }
}


// ----------------------------------------------------
// 1. ENDPOINT PARA LA VERIFICACIÓN DEL WEBHOOK (GET)
// ----------------------------------------------------
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


// ----------------------------------------------------
// 2. ENDPOINT PARA RECIBIR MENSAJES (POST)
// ----------------------------------------------------
app.post('/webhook', (req, res) => {
    let body = req.body;

    // Solo procesamos eventos de WhatsApp Business Account
    if (body.object === 'whatsapp_business_account') {
        body.entry.forEach(entry => {
            entry.changes.forEach(change => {
                if (change.field === 'messages') {
                    const messageData = change.value;

                    if (messageData.messages && messageData.messages[0]) {
                        const message = messageData.messages[0];
                        const from = message.from; // Número del remitente
                        const type = message.type; 

                        console.log(`Mensaje entrante de: ${from}`);

                        // Lógica de Respuesta
                        if (type === 'text') {
                            const text = message.text.body.toLowerCase();
                            console.log(`Contenido: ${text}`);

                            let responseText = "Gracias por tu mensaje. Soy un bot de prueba. Por favor, escribe 'info' o 'ayuda'.";

                            if (text.includes('info')) {
                                responseText = "Esta es una plataforma BSP de prueba construida con Node.js y Express.";
                            } else if (text.includes('ayuda')) {
                                responseText = "¿En qué te puedo ayudar hoy? Mi creador está aprendiendo a usar la API de WhatsApp.";
                            }
                            
                            // *** Llamamos a la función para enviar la respuesta ***
                            sendMessage(from, responseText);
                        } 
                        // Aquí se puede añadir lógica para otros tipos (imágenes, audios, etc.)
                    }
                }
            });
        });

        // Respondiendo 200 OK a Meta
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404); 
    }
});

app.get('/', (req, res) => {
    res.send('El servidor de WhatsApp BSP está corriendo. Esperando Webhooks...');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
});