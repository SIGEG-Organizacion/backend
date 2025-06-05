// middlewares/fileUpload.js
import multer from "multer";
import path from "path";

// Configuración de multer para almacenar los archivos en la carpeta `uploads`
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se guardarán temporalmente los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Nombre único para cada archivo
  },
});

const upload = multer({ storage: storage });

// Exportar el middleware para ser usado en las rutas
export const uploadLogo = upload.single("logo"); 
