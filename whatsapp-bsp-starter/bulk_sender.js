// bulk_sender.js
import dotenv from 'dotenv';
import axios from 'axios';

// 1. Cargar variables de entorno (las mismas que usa server.js)
dotenv.config();

// Lista de prueba de números de teléfono (¡Reemplaza esto con tus 5000 números!)
// NOTA: Deben incluir el código de país (ej. 57300...)
const phoneNumbers = [
    '573175666526', // Tu lista de 5000 números con código de país
    '573219092779'
];

// Nombre de la plantilla que ya sabemos que funciona
const TEMPLATE_NAME = 'hello_world'; 

async function sendTemplateMessage(to, templateName) {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

    // Estructura de la plantilla (la misma que ya verificamos)
    const data = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: "en_US" // Usamos 'en_US' porque comprobamos que 'es' da error
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
        console.log(`✅ Éxito al enviar [${templateName}] a: ${to}`);
        return true;
    } catch (error) {
        console.error(`❌ Error al enviar [${templateName}] a ${to}:`, error.response ? error.response.data : error.message);
        return false;
    }
}

async function sendBulk() {
    console.log(`\n--- Iniciando envío de plantilla '${TEMPLATE_NAME}' a ${phoneNumbers.length} destinatarios ---`);
    let successfulSends = 0;

    for (const number of phoneNumbers) {
        const success = await sendTemplateMessage(number, TEMPLATE_NAME);
        if (success) {
            successfulSends++;
        }
        
        // ⚠️ MUY IMPORTANTE: Pausa para evitar ser bloqueado por Meta o considerado spam.
        // Un retraso de 500ms (0.5 segundos) es un buen punto de partida.
        await new Promise(resolve => setTimeout(resolve, 500)); 
    }

    console.log(`\n--- Proceso finalizado ---`);
    console.log(`Total enviados con éxito: ${successfulSends}/${phoneNumbers.length}`);
}

// Ejecutar la función de envío masivo
sendBulk();