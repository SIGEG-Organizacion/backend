import multer from "multer";
import path from "path";
import fs from "fs";

// Carpeta de uploads temporales
const uploadPath = "./uploads";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// Storage único para logo y document
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname === "logo" ? "logo" : "flyer";
    cb(null, `${prefix}-${unique}${ext}`);
  },
});

// Ahora permitimos png/jpg/jpeg **y** pdf
const fileFilter = (_req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Sólo se permiten .png, .jpg, .jpeg y .pdf"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // hasta 10 MB
  fileFilter,
});
