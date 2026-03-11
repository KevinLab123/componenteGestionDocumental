let resizing = false;
let startX = 0;
let startWidth = 0;
let resizeCell = null;

const pageFormats = {
    A4: {
        width: 794,
        height: 1123
    },
    LETTER: {
        width: 816,
        height: 1056
    },
    LEGAL: {
        width: 816,
        height: 1344
    }
};

function applyPageFormat(format) {

    const container = document.getElementById("document-container");
    const page = pageFormats[format];

    if (!container || !page) return;

    container.style.width = page.width + "px";
    container.style.minHeight = page.height + "px";

}

function getCurrentCell() {

    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    let node = selection.anchorNode;

    if (node.nodeType === 3) {
        node = node.parentNode;
    }

    return node.closest("td");
}


function buildTableMatrix(table) {

    const matrix = [];

    for (let r = 0; r < table.rows.length; r++) {

        const row = table.rows[r];
        matrix[r] = [];
        let colIndex = 0;

        for (let cell of row.cells) {

            while (matrix[r][colIndex]) colIndex++;

            const rowspan = parseInt(cell.getAttribute("rowspan")) || 1;
            const colspan = parseInt(cell.getAttribute("colspan")) || 1;

            for (let i = 0; i < rowspan; i++) {
                for (let j = 0; j < colspan; j++) {

                    if (!matrix[r + i]) matrix[r + i] = [];

                    matrix[r + i][colIndex + j] = cell;
                }
            }

            colIndex += colspan;
        }
    }

    return matrix;
}

function mergeRight(table) {

    const td = getCurrentCell();
    if (!td) return;

    const tr = td.parentElement;

    const matrix = buildTableMatrix(table);

    const rowIndex = tr.rowIndex;

    const totalColumns = matrix[0].length;

    const realCells = Array.from(tr.children);

    realCells.forEach(cell => {

        if (cell !== td) {
            cell.remove();
        }

    });

    td.setAttribute("colspan", totalColumns);

}

function addColumn(table) {

    const currentCell = getCurrentCell();
    if (!currentCell) return;

    const matrix = buildTableMatrix(table);

    let colIndex = -1;

    for (let r = 0; r < matrix.length; r++) {
        const c = matrix[r].indexOf(currentCell);
        if (c !== -1) {
            colIndex = c;
            break;
        }
    }

    if (colIndex === -1) return;

    const insertIndex = colIndex + 1;

    for (let r = 0; r < matrix.length; r++) {

        const row = table.rows[r];
        const refCell = matrix[r][colIndex];

        const colspan = parseInt(refCell.getAttribute("colspan")) || 1;

        if (colspan > 1) {

            refCell.setAttribute("colspan", colspan + 1);

        } else {

            const td = document.createElement("td");

            td.contentEditable = "true";
            td.textContent = "Celda";

            td.setAttribute("colspan","1");
            td.setAttribute("rowspan","1");

            refCell.after(td);

        }
    }
}

function deleteColumn(table){

    const currentCell = getCurrentCell();
    if(!currentCell) return;

    const matrix = buildTableMatrix(table);

    let colIndex = -1;

    for(let r=0; r<matrix.length; r++){

        const c = matrix[r].indexOf(currentCell);

        if(c !== -1){
            colIndex = c;
            break;
        }

    }

    if(colIndex === -1) return;

    for(let r=0; r<matrix.length; r++){

        const cell = matrix[r][colIndex];

        if(!cell) continue;

        const colspan = parseInt(cell.getAttribute("colspan")) || 1;

        if(colspan > 1){

            cell.setAttribute("colspan", colspan - 1);

        }else{

            cell.remove();

        }

    }

}

document.addEventListener("click", function(e){

    const target = e.target;

    const tableWrapper = target.closest(".table-wrapper");
    if(!tableWrapper) return;

    const table = tableWrapper.querySelector("table");
    if(!table) return;

    // Agregar columna
    if(target.classList.contains("btn-add-col")){
        addColumn(table);
    }

    // Eliminar columna
    if(target.classList.contains("btn-delete-col")){
        deleteColumn(table);
    }

    // Agregar fila
    if(target.classList.contains("btn-add-row")){

        const matrix = buildTableMatrix(table);
        const totalCols = matrix[0].length;

        const newRow = table.insertRow();

        for(let i=0;i<totalCols;i++){

            const td = document.createElement("td");

            td.contentEditable = "true";
            td.textContent = "Celda";
            td.setAttribute("colspan","1");
            td.setAttribute("rowspan","1");

            newRow.appendChild(td);

        }
    }

    // Eliminar fila
    if(target.classList.contains("btn-delete-row")){
        deleteRow(table);
    }

    // Combinar a la derecha
    if(target.classList.contains("btn-merge-right")){
        mergeRight(table);
    }

});




function clearDocument() {

    ["doc-header", "doc-body", "doc-footer"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

}

function sanitizeLoadedImages(container){

    const wrappers = container.querySelectorAll(".image-wrapper");

    wrappers.forEach(wrapper => {

        const topControls = wrapper.querySelector(".image-controls-top");
        if(topControls) topControls.remove();

        const bottomControls = wrapper.querySelector(".image-controls-bottom");
        if(bottomControls) bottomControls.remove();

        wrapper.querySelectorAll(".resize-handle").forEach(h => h.remove());

        wrapper.setAttribute("contenteditable", "false");

        const imgContainer = wrapper.querySelector(".img-container");
        if(imgContainer){
            imgContainer.setAttribute("contenteditable","false");
        }

    });

}

function sanitizeLoadedTables(container){

    const wrappers = container.querySelectorAll(".table-wrapper");

    wrappers.forEach(wrapper => {

        const deleteTableBtn = wrapper.querySelector(".btn-delete-table");

        if(deleteTableBtn){
            deleteTableBtn.remove();
        }

    });

}

function sanitizeHeaderLogoButton(container){

    const logoBtn = container.querySelector("#insert-header-logo-btn");

    if(logoBtn){
        logoBtn.remove();
    }

}

function enableTableEditing(container){

    const tables = container.querySelectorAll("table");

    tables.forEach(table => {

        table.querySelectorAll("td").forEach(td => {

            td.contentEditable = "true";

            if(!td.getAttribute("colspan"))
                td.setAttribute("colspan","1");

            if(!td.getAttribute("rowspan"))
                td.setAttribute("rowspan","1");

        });

    });

}


async function loadTemplate() {

    clearDocument();

    const id = prompt("Ingrese el ID del documento");

    if (!id) {
        alert("Debe ingresar un ID");
        return;
    }

    try {

        const response = await fetch(`http://localhost:3000/documents/${id}`);

        if (!response.ok) {
            throw new Error("Error HTTP: " + response.status);
        }

        const data = await response.json();

        console.log("Respuesta API:", data);

        const documentData = Array.isArray(data) ? data[0] : data;

        renderTemplate(documentData);

        //  APLICAR LA FUENTE AL DOCUMENTO
        if (documentData.font) {

            const documentContainer = document.getElementById("document-container");

            documentContainer.style.fontFamily = documentData.font;

        }

    } catch (error) {

        console.error("Error real:", error);
        alert("No se pudo cargar el documento");

    }

}

function renderTemplate(doc) {

    const header = document.getElementById("doc-header");
    const body = document.getElementById("doc-body");
    const footer = document.getElementById("doc-footer");
    const container = document.getElementById("document-container");

    if (header) header.innerHTML = doc.header || "";
    if (body) body.innerHTML = doc.content || "";
    if (footer) footer.innerHTML = doc.footer || "";

    // --- APLICAR FORMATO DE PÁGINA ---
    if (doc.pageformat) {
        applyPageFormat(doc.pageformat);
    }

    // --- APLICAR FUENTE DE LA PLANTILLA ---
    if (doc.font && container) {

        container.style.fontFamily = doc.font;

        const elements = container.querySelectorAll("*");

        elements.forEach(el => {
            el.style.fontFamily = doc.font;
        });

    }

    // --- ELIMINAR BOTÓN DE LOGO ---
    sanitizeHeaderLogoButton(header);

    // --- LIMPIAR IMÁGENES ---
    sanitizeLoadedImages(header);
    sanitizeLoadedImages(body);
    sanitizeLoadedImages(footer);

    // --- LIMPIAR TABLAS ---
    sanitizeLoadedTables(header);
    sanitizeLoadedTables(body);
    sanitizeLoadedTables(footer);

    // --- REACTIVAR EDICIÓN DE TABLAS ---
    enableTableEditing(header);
    enableTableEditing(body);
    enableTableEditing(footer);

}