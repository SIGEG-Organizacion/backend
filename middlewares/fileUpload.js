// middlewares/fileUpload.js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Nombre único para el archivo
  },
});

const upload = multer({ storage });

// Exporta el middleware upload
export default upload;
