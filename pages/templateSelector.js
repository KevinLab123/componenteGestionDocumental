document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cards-container');

    // 1. Obtener las plantillas desde la API
    const loadTemplates = async () => {
        try {
            const response = await fetch('http://localhost:3000/documents');
            
            if (!response.ok) throw new Error('Error al obtener plantillas');
            
            const templates = await response.json();
            renderCards(templates);
        } catch (error) {
            console.error('Error:', error);
            cardsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        No se pudieron cargar las plantillas. ¿Está encendido el servidor?
                    </div>
                </div>`;
        }
    };

    // 2. Renderizar las tarjetas con las nuevas clases de identificación
    const renderCards = (templates) => {
        cardsContainer.innerHTML = ''; 

        templates.forEach((doc, index) => {
            const cardCol = document.createElement('div');
            cardCol.className = 'col';

            cardCol.innerHTML = `
                <div class="card template-card h-100 shadow-sm border-0">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-center text-dark mb-3 fw-bold">
                            ${doc.name}
                        </h5>
                        
                        <div class="p-3 mb-3 template-details-box bg-light border rounded shadow-sm" style="font-size: 0.9rem;">
                            <h6 class="fw-bold border-bottom pb-1 mb-2">Detalles</h6>
                            <ul class="list-unstyled mb-0 text-secondary">
                                <li class="mb-1"><strong>Nombre:</strong> ${doc.name}</li>
                                <li class="mb-1"><strong>Departamento:</strong> ${doc.department}</li>
                                <li class="mb-1"><strong>Fuente:</strong> ${doc.font}</li>
                                <li><strong>Formato:</strong> ${doc.pageFormat || doc.pageformat || 'N/A'}</li>
                            </ul>
                        </div>

                        <div class="mt-auto d-grid gap-2">
                            <button onclick="previewTemplate(${doc.id})" class="btn btn-primary shadow-sm">
                                <i class="bi bi-eye me-2"></i>Pre visualizar
                            </button>
                            <button onclick="selectTemplate(${doc.id})" class="btn btn-success shadow-sm">
                                <i class="bi bi-check2-circle me-2"></i>Seleccionar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cardsContainer.appendChild(cardCol);
        });
    };

    // Iniciar carga al disparar el DOMContentLoaded
    loadTemplates();
});

/** * FUNCIONES GLOBALES */

function selectTemplate(id) {
    // Redirección directa al manejador pasando el ID por URL
    window.location.href = `templateHandler.html?id=${id}`;
}

function previewTemplate(id) {
    // Lógica para previsualización (puedes implementar un modal aquí luego)
    console.log("Previsualizando plantilla con ID:", id);
    alert("Iniciando previsualización de la plantilla #" + id);
}