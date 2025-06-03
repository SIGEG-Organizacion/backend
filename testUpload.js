import { uploadFileToB2 } from "./utils/b2Uploader.js";
import fs from "fs";
import dotenv from 'dotenv';  // Importar dotenv
dotenv.config();  // Cargar las variables de entorno

console.log("B2_BUCKET_NAME:", process.env.B2_BUCKET_NAME); 

// archivo de prueba para verificar que la integración está funcionando
const filePath = "./test_flyer.pdf"; // archivo de prueba
const fileName = "flyers/test_flyer.pdf"; // Nombre que tendrá el archivo en Backblaze


uploadFileToB2(filePath, fileName)
  .then((fileUrl) => {
    console.log("Archivo subido exitosamente. URL:", fileUrl);

  })
  .catch((err) => {
    console.log("Error al subir archivo:", err);

  });
