import fs from "fs";
import s3 from "../config/b2Client.js"; // Cliente S3 para Backblaze
import path from "path";

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

export const uploadDocumentToB2 = async (file, opportunityUuid) => {
  if (!process.env.B2_BUCKET_NAME) {
    throw new Error("Missing Backblaze Bucket Name in environment variables.");
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = path.extname(file.originalname).substring(1).toLowerCase();
  const fileName = `flyers/flyer_${opportunityUuid}_${timestamp}.${ext}`;
  const fileContent = fs.readFileSync(file.path);
  const contentType = file.mimetype || "application/octet-stream";

  const params = {
    Bucket: process.env.B2_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: contentType,
    ACL: "private",
  };

  try {
    await s3.upload(params).promise();
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: params.Bucket,
      Key: params.Key,
      Expires: 3600,
    });
    return signedUrl;
  } catch (err) {
    console.error("Error uploading document to B2:", err);
    throw new Error(`Error uploading document to B2: ${err.message}`);
  } finally {
    try {
      fs.unlinkSync(file.path);
    } catch (_) {}
  }
};

export const uploadLogoToB2 = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: process.env.B2_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: "image/png",
    ACL: "private",
  };
  try {
    const data = await s3.upload(params).promise();
    console.log("t4");
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Expires: 3600,
    });
    console.log("t5");
    return signedUrl;
  } catch (err) {
    console.error("Error al subir logo a Backblaze B2:", err.message);
    throw new Error(`Error uploading logo to B2: ${err.message}`);
  }
};

export const getSignedUrlFromB2 = (key, expiresIn = 3600) => {
  if (!process.env.B2_BUCKET_NAME) {
    throw new Error("Missing Backblaze Bucket Name in environment variables.");
  }
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
    Expires: expiresIn,
  });
};
