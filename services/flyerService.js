// services/flyerService.js
import { generateFlyerPDF } from "../utils/flyerGenerator.js";

export const createFlyer = async (opportunityId, format, logoUrl) => {
  const opportunity = await Opportunity.findById(opportunityId).populate({
    path: "companyId",
  });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  // Ruta temporal del flyer
  const outputPath = path.resolve(`./temp/flyer_${opportunity.uuid}.${format}`);

  // Generar el flyer con el logo
  await generateFlyerPDF(opportunity, logoUrl, outputPath);

  // Subir el archivo y obtener la URL firmada
  const fileName = `flyers/flyer_${opportunity.uuid}.${format}`;
  const signedUrl = await uploadFileToB2(outputPath, fileName);

  let flyer = await Flyer.findOne({ opportunityId });
  if (!flyer) {
    flyer = new Flyer({
      opportunityId,
      status: "active",
      format,
      url: signedUrl, // URL del flyer
      content: opportunity.description,
    });
  } else {
    flyer.url = signedUrl; // Actualizamos la URL
    flyer.status = "active";
  }

  await flyer.save();
  fs.unlinkSync(outputPath); // Eliminar archivo temporal

  return flyer;
};
