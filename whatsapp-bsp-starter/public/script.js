// LÓGICA PARA EL CAMBIO DE PESTAÑAS (la dejamos igual)

let allTemplates = []; // Variable global para almacenar las plantillas

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";

    // 🚨 CAMBIO AQUÍ: Solo actúa si evt no es null y tiene currentTarget
    if (evt && evt.currentTarget) {
        evt.currentTarget.className += " active";
    } else {
        // Opcional: Si evt es null, busca el botón manualmente para activarlo
        const btn = document.querySelector(`button[onclick*="${tabName}"]`);
        if (btn) btn.classList.add("active");
    }
}

// ----------------------------------------------------
// 1. OBTENER CONFIGURACIÓN (PARA LA PESTAÑA DE CONFIGURACIÓN)
// ----------------------------------------------------
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();

        document.getElementById('phone-id').innerText = config.phoneId;
        document.getElementById('waba-id').innerText = config.wabaId;

    } catch (error) {
        console.error('Error al cargar configuración:', error);
        document.getElementById('phone-id').innerText = 'ERROR';
        document.getElementById('waba-id').innerText = 'ERROR';
    }
}


// ----------------------------------------------------
// 2. OBTENER Y VISUALIZAR PLANTILLAS EXISTENTES
// ----------------------------------------------------
async function fetchTemplates() {
    const listContainer = document.getElementById('template-list');
    const statusElement = document.getElementById('loading-status');

    listContainer.innerHTML = ''; // Limpiar lista
    statusElement.innerText = 'Cargando plantillas desde Meta... Esto puede tardar unos segundos.';

    try {
        const response = await fetch('/api/templates');
        const templates = await response.json();

        // if (response.ok) {
        //     if (templates.length === 0) {
        //         statusElement.innerText = 'No se encontraron plantillas. Crea una nueva en la pestaña "Crear".';
        //         return;
        //     }
        if (response.ok) {
            allTemplates = templates; // 🚨 GUARDAMOS LAS PLANTILLAS AQUÍ

            templates.forEach(template => {
                // Mapeamos el estado al CSS (ej. PENDING, APPROVED, REJECTED)
                const statusClass = `status-${template.status}`;

                const card = document.createElement('div');
                card.className = 'template-card';
                card.innerHTML = `
                        <h3>${template.name}</h3>
                        <p><strong>Estado:</strong> <span class="status-badge ${statusClass}">${template.status}</span></p>
                        <p><strong>Categoría:</strong> ${template.category}</p>
                        <p><strong>Idioma:</strong> ${template.language}</p>
                        <p><strong>Cuerpo:</strong> ${template.components.find(c => c.type === 'BODY')?.text || 'N/A'}</p>
                    `;
                listContainer.appendChild(card);
            });
            statusElement.innerText = `Éxito. ${templates.length} plantillas cargadas.`;

        } else {
            // Si el Backend devolvió un error (ej. 500), lo mostramos
            statusElement.innerText = `Error: ${templates.details || 'Fallo desconocido al cargar plantillas.'}`;
        }

    } catch (error) {
        console.error('Error de conexión con el Backend:', error);
        statusElement.innerText = 'Error de conexión con el servidor Node.js. Asegúrate de que está corriendo.';
    }
}


// ====================================================
// LÓGICA DE INTERFAZ PARA CREACIÓN DE PLANTILLAS
// ====================================================

// Manejo de Encabezado (SIN CAMBIOS, se mantiene igual)
document.getElementById('header-type').addEventListener('change', function () {
    const contentGroup = document.getElementById('header-content-group');
    const headerContent = document.getElementById('header-content');

    if (this.value === 'TEXT') {
        contentGroup.style.display = 'block';
        headerContent.placeholder = 'Ej: ¡Hola {{1}}!';
        headerContent.required = true;
    } else if (this.value === 'NONE') {
        contentGroup.style.display = 'none';
        headerContent.required = false;
    } else {
        contentGroup.style.display = 'none';
        headerContent.required = false;
    }
});

// Función para añadir un nuevo bloque de botón
function addButtonBlock() {
    const container = document.getElementById('buttons-container');
    const buttonIndex = Date.now(); // Usamos timestamp como ID único

    // Límite máximo de botones de WhatsApp
    if (container.children.length >= 3) {
        alert('Solo se permiten hasta 3 botones por plantilla.');
        return;
    }

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'button-config';
    buttonDiv.setAttribute('data-id', buttonIndex); // ID único para referencia
    buttonDiv.innerHTML = `
        <hr>
        <h4>Botón #${container.children.length + 1}</h4>
        <div class="form-group">
            <label for="btn-type-${buttonIndex}">Tipo:</label>
            <select id="btn-type-${buttonIndex}" data-id="${buttonIndex}" class="btn-type-select" required>
                <option value="QUICK_REPLY">Respuesta Rápida</option>
                <option value="URL">Llamada a URL</option>
            </select>
        </div>
        <div class="form-group">
            <label for="btn-text-${buttonIndex}">Texto del Botón:</label>
            <input type="text" id="btn-text-${buttonIndex}" class="btn-text-input" required placeholder="Ej: ¡Contestar!">
        </div>
        <div class="form-group url-group" id="url-group-${buttonIndex}" style="display:none;">
            <label for="btn-url-${buttonIndex}">URL (Estática o {{1}}):</label>
            <input type="text" id="btn-url-${buttonIndex}" class="btn-url-input" placeholder="Ej: https://tudominio.com/{{1}}">
        </div>
        <button type="button" class="remove-button" onclick="this.closest('.button-config').remove()">Eliminar Botón</button>
    `;
    container.appendChild(buttonDiv);

    // Asignar el evento al nuevo select
    document.getElementById(`btn-type-${buttonIndex}`).addEventListener('change', function () {
        const id = this.dataset.id;
        const urlGroup = document.getElementById(`url-group-${id}`);
        const urlInput = document.getElementById(`btn-url-${id}`);

        if (this.value === 'URL') {
            urlGroup.style.display = 'block';
            urlInput.required = true;
        } else {
            urlGroup.style.display = 'none';
            urlInput.required = false;
        }
    });
}

// Evento principal para añadir botón
document.getElementById('add-button').addEventListener('click', addButtonBlock);

// ----------------------------------------------------
// 3. ENVÍO DE NUEVA PLANTILLA A APROBACIÓN (Actualizado)
// ----------------------------------------------------
document.getElementById('template-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // 1. Recolección de Datos Básicos
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const language = document.getElementById('language').value;
    const body = document.getElementById('body').value;
    const footer = document.getElementById('footer').value;
    const exampleText = document.getElementById('examples').value;

    let examples = [];
    if (exampleText.trim() !== '') {
        // Divide el texto por comas y limpia espacios
        examples = exampleText.split(',').map(ex => ex.trim());
    }

    // 2. Recolección de Encabezado
    const headerType = document.getElementById('header-type').value;
    const headerContent = document.getElementById('header-content').value;
    const header = (headerType !== 'NONE') ? {
        type: headerType, // TEXT, IMAGE, VIDEO
        content: headerContent // Solo relevante si type es TEXT
    } : null;

    // 3. Recolección de Botones
    const buttons = [];
    document.querySelectorAll('.button-config').forEach((div) => {
        const btnType = div.querySelector('.btn-type-select').value;
        const btnText = div.querySelector('.btn-text-input').value;
        const btnUrlInput = div.querySelector('.btn-url-input');


        let button = {
            type: btnType, // QUICK_REPLY o URL
            text: btnText
        };

        if (btnType === 'URL' && btnUrlInput.value.trim() !== '') {
            button.url = btnUrlInput.value;
        }
        buttons.push(button);
    });

    // 4. Paquete de Datos Final
    const data = { name, category, language, body, footer, header, buttons, examples };

    // Validamos que el nombre esté en minúsculas (requisito de Meta)
    if (name !== name.toLowerCase() || name.includes(' ')) {
        alert('El nombre de la plantilla debe estar en minúsculas y no debe contener espacios.');
        return;
    }

    // 5. Envío al Backend (La lógica de envío AJAX)
    try {
        // 🚨 CORRECCIÓN: Definir submitBtn fuera del try para que finally lo vea
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando...';

        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            alert(`✅ Éxito: Plantilla "${name}" enviada para aprobación.`);
            this.reset();

            // Limpiar botones dinámicos
            document.getElementById('buttons-container').innerHTML = '';

            // 🚨 CORRECCIÓN: openTab(null, ...) ya que no hay evento de clic aquí
            openTab(null, 'Visualizacion');

        } else {
            // ... (código de manejo de error igual) ...
        }
    } catch (error) {
        // ... (código de manejo de error de conexión igual) ...
    } finally {
        // 🚨 CORRECCIÓN: submitBtn ahora está definida y puede usarse aquí
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Enviar a Meta para Aprobación';
        }
    }
});

// ----------------------------------------------------
// 4. ENVÍO MASIVO DE PLANTILLAS
// ----------------------------------------------------
document.getElementById('bulk-send-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const templateName = document.getElementById('bulk-template-name').value;
    const language = document.getElementById('bulk-language').value; //  Capturamos el idioma
    const recipientListText = document.getElementById('recipient-list').value;
    const statusElement = document.getElementById('bulk-status');
    const resultsElement = document.getElementById('bulk-results');


    // 1. Limpieza de datos
    // Bloque CORREGIDO (Acepta comas, puntos y comas, y saltos de línea)
    // Reemplaza todos los separadores comunes con un solo salto de línea ('\n')
    const cleanedText = recipientListText
        .replace(/,|;|\s+/g, '\n') // Reemplaza comas, puntos y comas, o múltiples espacios por un salto de línea
        .replace(/\\/g, '\n');      // Si el usuario usa '\' como separador (como hiciste tú)

    const recipients = cleanedText
        .split('\n') // Ahora sí, divide por el salto de línea
        .map(num => num.trim())
        .filter(num => num.length > 5); // Filtra números válidos

    if (recipients.length === 0) {
        statusElement.innerHTML = '<span class="status-rejected">❌ Lista de destinatarios vacía o inválida.</span>';
        return;
    }


    // 2. Estado de Envío
    resultsElement.innerHTML = ''; // Limpiar resultados anteriores
    statusElement.innerHTML = `<span class="status-pending">🚀 Iniciando envío a ${recipients.length} destinatarios...</span>`;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Enviando...';

    // Actualizamos el objeto 'data' para incluir el idioma
    const data = {
        templateName,
        language, // 🚨 Enviamos el idioma al Backend
        recipients
    };

    // 3. Petición al Backend
    try {
        const response = await fetch('/api/bulk-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        const result = await response.json();

        // 4. Manejo de Respuesta
        if (response.ok) {
            statusElement.innerHTML = `<span class="status-approved">✅ ${result.message}</span>`;

            // Mostrar resultados detallados
            let resultsHtml = '<h4>Detalle de Envíos:</h4>';
            resultsHtml += result.results.map(r => {
                const statusClass = r.success ? 'status-approved' : 'status-rejected';
                const message = r.success ? 'ÉXITO' : `FALLO: ${r.error.message || 'Error desconocido'}`;
                return `<p><span class="${statusClass}">${r.recipient}</span>: ${message}</p>`;
            }).join('');
            resultsElement.innerHTML = resultsHtml;

        } else {
            statusElement.innerHTML = `<span class="status-rejected">❌ Error en el servidor: ${result.details || result.error}</span>`;
            console.error('Error del Backend:', result);
        }
    } catch (error) {
        statusElement.innerHTML = '<span class="status-rejected">❌ Error de conexión al servidor Node.js.</span>';
        console.error('Fallo al realizar la petición POST:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Iniciar Envío Masivo';
    }
});

// Llena el datalist con los nombres de las plantillas cargadas
function updateTemplateSuggestions() {
    const datalist = document.getElementById('template-suggestions');
    datalist.innerHTML = '';

    allTemplates.forEach(temp => {
        const option = document.createElement('option');
        option.value = temp.name;
        datalist.appendChild(option);
    });
}

// 🚨 DETECTAR EL CAMBIO Y EXTRAER EL IDIOMA
document.getElementById('bulk-template-name').addEventListener('input', function (e) {
    const selectedName = e.target.value;
    const languageInput = document.getElementById('bulk-language');

    // Buscamos la plantilla en nuestra variable global
    const found = allTemplates.find(t => t.name === selectedName);

    if (found) {
        languageInput.value = found.language; // 🚨 ASIGNA EL IDIOMA AUTOMÁTICAMENTE
        languageInput.classList.add('status-approved'); // Feedback visual
    } else {
        languageInput.value = '';
        languageInput.classList.remove('status-approved');
    }
});

// Inicializar la carga de datos al cargar la página
loadConfig();
fetchTemplates();

// Abrir la pestaña de visualización por defecto
document.getElementById('Visualizacion').style.display = 'block';
document.querySelector('.tab-button').classList.add('active');