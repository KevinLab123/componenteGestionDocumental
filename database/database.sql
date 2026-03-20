CREATE DATABASE documents_db;

CREATE TABLE documents (
    id INTEGER PRIMARY KEY,       -- Identificador único, entero  y clave primaria
    content TEXT NOT NULL,       -- Contenido del documento, obligatorio
    name TEXT,                   -- Nombre del documento
    department TEXT,             -- Departamento asociado
    font TEXT,                   -- Fuente utilizada
    header TEXT,                 -- Encabezado
    footer TEXT,                 -- Pie de página
    pageformat TEXT              -- Formato de página
);

CREATE TABLE reports (
    id INTEGER PRIMARY KEY,          -- Identificador único para cada reporte
    baseTemplate INTEGER NOT NULL,  -- Referencia al id de la tabla documents
    consecutive TEXT,               -- Texto para manejar consecutivos

    -- Definición de la llave foránea sin acciones en cascada
    CONSTRAINT fk_baseTemplate
        FOREIGN KEY (baseTemplate)
        REFERENCES documents (id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

