import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const WABA_ID = process.env.WABA_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

// Función para obtener todas las plantillas existentes de Meta (SIN CAMBIOS)
export async function getTemplates() {
    if (!WABA_ID || !ACCESS_TOKEN) {
        throw new Error("WABA_ID o ACCESS_TOKEN no están configurados correctamente en .env");
    }
    const url = `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates`;

    const response = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
        }
    });
    return response.data.data;
}


// ----------------------------------------------------
// 🚨 NUEVA FUNCIÓN: Crear Plantilla (Soporte para Header, Footer, Botones y Ejemplos)
// ----------------------------------------------------
export async function createTemplate({ name, category, language, body, footer, header, buttons, examples }) {
    if (!WABA_ID || !ACCESS_TOKEN) {
        throw new Error("WABA_ID o ACCESS_TOKEN no están configurados correctamente en .env");
    }
    const url = `https://graph.facebook.com/v22.0/${WABA_ID}/message_templates`;
    
    const components = [];

    // 1. Añadir el componente HEADER (si existe) (SIN CAMBIOS)
    // ... (Lógica de HEADER igual) ...

    // 2. Añadir el componente BODY (OBLIGATORIO)
    const bodyComponent = { type: "BODY", text: body };
    
    // 🚨 AGREGAR MUESTRAS DE VARIABLES (si existen y si el body tiene variables)
    if (examples && Array.isArray(examples) && examples.length > 0) {
        bodyComponent.example = {
            body_text: examples // Array de strings con los valores de ejemplo
        };
    }
    components.push(bodyComponent);

    // 3. Añadir el componente FOOTER (si existe) (SIN CAMBIOS)
    // ... (Lógica de FOOTER igual) ...

    // 4. Añadir el componente BUTTONS (si existe) (SIN CAMBIOS)
    // ... (Lógica de BUTTONS igual) ...

    // 5. Estructura final de la plantilla (SIN CAMBIOS)
    const templateData = {
        name: name,
        category: category,
        language: language,
        components: components
    };
    
    const response = await axios.post(url, templateData, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

// Función para enviar un mensaje basado en plantilla
export async function sendTemplateMessage(phoneNumber, templateName, languageCode = 'es') {
    if (!ACCESS_TOKEN || !process.env.PHONE_NUMBER_ID) {
        throw new Error("Configuración de envío incompleta en .env");
    }

    const url = `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: languageCode // 🚨 Aquí usamos el parámetro dinámico
            }
        }
    };

    const response = await axios.post(url, data, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data;
}