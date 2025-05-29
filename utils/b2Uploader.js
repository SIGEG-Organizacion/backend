import fs from "fs";
import s3 from "../config/b2Client.js"; 

export const uploadFileToB2 = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath); 

  const params = {
    Bucket: process.env.B2_BUCKET_NAME, 
    Key: fileName, 
    Body: fileContent, 
    ContentType: "application/pdf", 
    ACL: "private", // El archivo no será público
  };

  try {
    // Subir el archivo a Backblaze B2
    const data = await s3.upload(params).promise();

    // Generar una URL firmada que expire en 1 hora (ajustable)
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Expires: 3600, 
    });

    return signedUrl; // Retorna la URL firmada
  } catch (err) {
    console.error("Error al subir archivo a Backblaze B2: ", err.message);
    throw new Error(`Error uploading file to B2: ${err.message}`);
  }
};
