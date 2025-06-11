// services/flyerService.js
import { generateFlyerPDF } from "../utils/flyerGenerator.js";

export const createFlyer = async (opportunityId, format, logoUrl) => {
  const opportunity = await Opportunity.findById(opportunityId).populate({
    path: "companyId",
  });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  const outputPath = path.resolve(`./temp/flyer_${opportunity.uuid}.${format}`);

  // Verificar que la carpeta temporal exista, si no, crearla
  if (!fs.existsSync(path.resolve("./temp"))) {
    fs.mkdirSync(path.resolve("./temp"));
  }

  // Generar el PDF
  await generateFlyerPDF(
    opportunity,
    logoUrl,
    outputPath
  );

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

  await flyer.save();
  fs.unlinkSync(outputPath);

  return flyer;
};


