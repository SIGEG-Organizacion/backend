import fs from "fs";
import s3 from "../config/b2Client.js"; // Cliente S3 para Backblaze

export const uploadFileToB2 = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath); // Leer el archivo desde el sistema de archivos

  // Verificar que el Bucket esté correctamente configurado
  if (!process.env.B2_BUCKET_NAME) {
    throw new Error("Missing Backblaze Bucket Name in environment variables.");
  }

  const params = {
    Bucket: process.env.B2_BUCKET_NAME, 
    Key: fileName, 
    Body: fileContent, 
    ContentType: "application/pdf",
    ACL: "private", 
  };

  try {
    // Subir el archivo a Backblaze B2
    const data = await s3.upload(params).promise();

    // Generar una URL firmada que expire en 1 hora (ajustable)
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Expires: 3600, // Expira en 1 hora
    });

    return signedUrl; // Retorna la URL firmada
  } catch (err) {
    console.error("Error al subir archivo a Backblaze B2: ", err.message);
    throw new Error(`Error uploading file to B2: ${err.message}`);
  }
};


export const uploadLogoToB2 = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath); // Leer el archivo desde el sistema de archivos

  const params = {
    Bucket: process.env.B2_BUCKET_NAME,
    Key: fileName, // Nombre del archivo en Backblaze
    Body: fileContent,
    ContentType: "image/png", // O "image/jpeg" dependiendo del tipo de logo
    ACL: "private", // El archivo será privado
  };

  try {
    // Subir el archivo a Backblaze B2
    const data = await s3.upload(params).promise();

    // Generar una URL firmada que expire en 1 hora (ajustable)
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Expires: 3600, // Expira en 1 hora
    });

    return signedUrl; // Retorna la URL firmada
  } catch (err) {
    console.error("Error al subir logo a Backblaze B2:", err.message);
    throw new Error(`Error uploading logo to B2: ${err.message}`);
  }
};

