import { generateFlyerPDF } from "../utils/flyerGenerator.js";
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

  // Definir la ruta de salida para el archivo generado
  const outputPath = path.resolve(`./temp/flyer_${opportunity.uuid}.${format}`);

  // Verificar que la carpeta temporal exista, si no, crearla
  if (!fs.existsSync(path.resolve("./temp"))) {
    fs.mkdirSync(path.resolve("./temp"));
    console.log("Temporary folder created: ./temp"); // Log para verificar la creación
  }
  console.log("T10");

  // Generar el PDF
  await generateFlyerPDF(opportunity, logoUrl, outputPath);
  console.log("T11");

  const fileName = `flyers/flyer_${opportunity.uuid}.${format}`;
  const signedUrl = await uploadFileToB2(outputPath, fileName);

  // Crear o actualizar el documento de flyer en MongoDB
  let flyer = await Flyer.findOne({ opportunityId });
  if (!flyer) {
    flyer = new Flyer({
      opportunityId,
      status: "active",
      format,
      url: signedUrl,
      content: opportunity.description,
    });
  } else {
    flyer.url = signedUrl;
    flyer.status = "active";
  }

  // Guardar el flyer en la base de datos
  await flyer.save();

  // Limpiar el archivo temporal local
  fs.unlinkSync(outputPath);

  return flyer;
};
