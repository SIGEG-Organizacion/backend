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

  await generateFlyerPDF(opportunity, logoUrl, outputPath);

  const fileName = `flyers/flyer_${opportunity.uuid}.${format}`;
  const signedUrl = await uploadFileToB2(outputPath, fileName);

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

