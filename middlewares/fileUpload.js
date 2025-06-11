import multer from "multer";
import path from "path";

// Configurar Multer para almacenar el archivo en un directorio temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = './uploads'; // Carpeta donde se guardarán los archivos
    // Verificar si el directorio existe, si no, crearlo
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "logo-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configuración de Multer para aceptar sólo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only .png, .jpg and .jpeg files are allowed!"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar el tamaño del archivo a 10MB (ajustable)
  fileFilter: fileFilter,
});
