// middlewares/fileUpload.js

import fileUpload from "express-fileupload";

// Configuración del middleware
export const upload = fileUpload({
  createParentPath: true, // Crear carpetas si no existen
  limits: { fileSize: 50 * 1024 * 1024 }, // Limitar el tamaño de los archivos (50MB)
});
