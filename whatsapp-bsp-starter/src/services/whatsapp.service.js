import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

// Función para enviar mensajes o plantillas (existente)
export async function sendTemplateMessage(to, templateName, languageCode = "en_US") {
    const url = `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`;

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
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ Respuesta enviada (Plantilla) a ${to}: "${templateName}"`);
        return { success: true, recipient: to };
    } catch (error) {
        console.error(`❌ Error al enviar plantilla a ${to}:`, error.response ? error.response.data : error.message);
        return { success: false, recipient: to, error: error.response ? error.response.data : error.message };
    }
}

// ----------------------------------------------------
// 🚨 NUEVA FUNCIÓN: Envío Masivo
// ----------------------------------------------------
/**
 * Envía una plantilla a una lista de destinatarios.
 * @param {Array<string>} recipients - Lista de números de teléfono (ej: ["57310xxxxxx", "57310xxxxxx"])
 * @param {string} templateName - Nombre de la plantilla a enviar.
 * @returns {Array} Un array con los resultados de cada envío.
 */
export async function sendBulkTemplateMessage(recipients, templateName, languageCode) {
    const results = [];
    
    // Usamos Promise.all para enviar los mensajes en paralelo y más rápido
    const sendPromises = recipients.map(recipient => {
        // En este ejemplo, solo enviamos en español ('es')
        return sendTemplateMessage(recipient, templateName, languageCode)
            .then(result => results.push(result))
            .catch(error => {
                console.error(`Fallo crítico al enviar a ${recipient}`, error);
                results.push({ success: false, recipient, error: "Fallo de servidor" });
            });
    });

    await Promise.all(sendPromises);
    return results;
}