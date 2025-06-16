import { generateFlyerPDF, generateFlyerPNG } from "../utils/flyerGenerator.js";
import Opportunity from "../models/opportunityModel.js";
import Flyer from "../models/flyerModel.js";
import { uploadFileToB2 } from "../utils/b2Uploader.js";
import fs from "fs";
import path from "path";

export const createFlyer = async (opportunityId, format, logoUrl) => {
  const opportunity = await Opportunity.findById(opportunityId).populate({
    path: "companyId",
  });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }
  console.log("Creating flyer with logo:", logoUrl);

  // Definir la ruta de salida para el archivo generado
  const ext = format && format.toLowerCase() === "png" ? "png" : "pdf";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = path.resolve(
    `./temp/flyer_${opportunity.uuid}_${timestamp}.${ext}`
  );

  // Verificar que la carpeta temporal exista, si no, crearla
  if (!fs.existsSync(path.resolve("./temp"))) {
    fs.mkdirSync(path.resolve("./temp"));
  }

  // Generar el archivo en el formato adecuado
  if (ext === "pdf") {
    await generateFlyerPDF(opportunity, logoUrl, outputPath);
  } else {
    await generateFlyerPNG(opportunity, logoUrl, outputPath);
  }

  // Subir el archivo a Backblaze B2 y obtener la ruta
  const fileName = `flyers/flyer_${opportunity.uuid}_${timestamp}.${ext}`;
  await uploadFileToB2(outputPath, fileName);

  // Crear o actualizar el documento de flyer en MongoDB
  let flyer = await Flyer.findOne({ opportunityId });
  if (!flyer) {
    flyer = new Flyer({
      opportunityId,
      status: "active",
      format: ext,
      url: fileName, // Guardamos solo la ruta
      content: opportunity.description,
    });
  } else {
    flyer.url = fileName;
    flyer.status = "active";
    flyer.format = ext;
  }
  console.log("Flyer URL in flyer:", flyer.url);

  // Guardar el flyer en la base de datos
  await flyer.save();

  // Limpiar el archivo temporal local
  fs.unlinkSync(outputPath);

  return flyer.toObject();
};
