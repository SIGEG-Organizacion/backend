import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import Opportunity from "../models/opportunityModel.js";
import Company from "../models/companyModel.js";
import { v4 as uuidv4 } from "uuid";
import User from "../models/userModel.js";
import Flyer from "../models/flyerModel.js";
import { generateFlyerPDF } from "../utils/flyerGenerator.js";
import { uploadFileToB2 } from "../utils/b2Uploader.js";
import path from "path";
import fs from "fs";

export const createOpportunity = async (
  userId,
  description,
  requirements,
  benefits,
  mode,
  deadline,
  contact,
  forStudents
) => {
  const opportunityExists = await Opportunity.findOne({
    description: description,
  });
  if (opportunityExists) {
    throw AppError.conflict("Conflict: Opportunity already exists");
  }
  const companyExists = await Company.findOne({ userId });
  if (!companyExists) {
    throw AppError.notFound("Not Found: Company doesnt exists");
  }
  const opportunity = new Opportunity({
    companyId: companyExists._id,
    description,
    requirements,
    benefits,
    mode,
    deadline: new Date(deadline),
    contact,
    status: "pending-approval",
    uuid: uuidv4(),
    forStudents,
  });
  await opportunity.save();
  return opportunity;
};

export const updateOpportunityFields = async (
  uuid,
  description,
  requirements,
  benefits,
  mode,
  deadline,
  contact,
  status,
  forStudents
) => {
  const opportunity = await Opportunity.findOne({ uuid });
  if (!opportunity) {
    throw AppError.notFound("Not Found: opportunity  doesnt exists");
  }
  // update only the provided fields
  if (description) opportunity.description = description;
  if (requirements) opportunity.requirements = requirements;
  if (benefits) opportunity.benefits = benefits;
  if (mode) opportunity.mode = mode;
  if (deadline) opportunity.deadline = deadline;
  if (contact) opportunity.contact = contact;
  if (status) {
    opportunity.status = status;
    //update flyer status to active/inactive to reflect the opportunity status
  }
  if (forStudents) {
    opportunity.forStudents = forStudents;
  }
  const updated = await opportunity.save();
  return updated;
};

export const deleteOpportunity = async (uuid) => {
  const opportunity = await Opportunity.findOne({ uuid });
  if (!opportunity) {
    throw AppError.notFound("Not Found: opportunity doesn't exist");
  }
  await opportunity.remove();
  const flyer = await Flyer.findOne({ opportunityId: opportunity._id });
  if (flyer) {
    await flyer.deleteOne();
  }
};

export const listOpportunitiesWithName = async (company_name) => {
  const user = await User.findOne({ name: company_name }, { _id: 1 });
  if (!user) {
    throw AppError.notFound("Not Found: user doesn't exist");
  }

  const company = await Company.findOne({ userId: user._id });
  if (!company) {
    throw AppError.notFound("Not Found: company doesn't exist");
  }

  const opportunities = await Opportunity.find({ companyId: company._id })
    .populate({
      path: "companyId",
      select: "address sector -_id",
      populate: {
        path: "userId",
        select: "name -_id",
      },
    })
    .select("-_id");

  return opportunities;
};

export const getOpportunityService = async (uuid) => {
  const opportunity = await Opportunity.findOne({ uuid })
    .populate({
      path: "companyId",
      select: "address sector -_id",
      populate: { path: "userId", select: "name -_id" },
    })
    .select("-_id");
  if (!opportunity) {
    throw AppError.notFound("Opportunity not found");
  }
  return opportunity;
};

export const getOpportunitiesFiltered = async (mode, from, to, sector) => {
  const query = {};
  if (mode) {
    query.mode = mode;
  }
  if (from || to) {
    query.deadline = {};
    if (from) query.deadline.$gte = new Date(from);
    if (to) query.deadline.$lte = new Date(to);
  }
  if (sector) {
    const companies = await Company.find({ sector }, "_id");
    const companyIds = companies.map((c) => c._id);
    query.companyId = { $in: companyIds };
  }
  const opportunities = await Opportunity.find(query)
    .populate({
      path: "companyId",
      select: "address sector -_id",
      populate: { path: "userId", select: "name -_id" },
    })
    .select("-_id");
  return opportunities;
};

export const createFlyer = async (opportunityId, format) => {
  // Obtener la oportunidad desde la base de datos
  const opportunity = await Opportunity.findById(opportunityId).populate({
    path: "companyId",
  });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  // Generar el PDF para el flyer
  const outputPath = path.resolve(`./temp/flyer_${opportunity.uuid}.pdf`);

  // Verificar que la carpeta temporal exista, si no, crearla
  if (!fs.existsSync(path.resolve("./temp"))) {
    fs.mkdirSync(path.resolve("./temp"));
  }

  // Generar el PDF
  await generateFlyerPDF(
    opportunity,
    opportunity.companyId.logoUrl,
    outputPath
  );

  // Subir el archivo a Backblaze B2 y obtener la URL firmada
  const fileName = `flyers/flyer_${opportunity.uuid}.pdf`;
  const signedUrl = await uploadFileToB2(outputPath, fileName);

  // Crear o actualizar el documento de flyer en MongoDB
  let flyer = await Flyer.findOne({ opportunityId });
  if (!flyer) {
    flyer = new Flyer({
      opportunityId,
      status: "active",
      format,
      url: signedUrl, // Guardamos la URL firmada
      content: opportunity.description,
    });
  } else {
    flyer.url = signedUrl; // Si ya existe, actualizamos la URL firmada
    flyer.status = "active";
  }

  // Guardar el flyer en la base de datos
  await flyer.save();

  // Limpiar el archivo temporal local
  fs.unlinkSync(outputPath);

  return flyer.toObject(); // Retorna el flyer creado/actualizado
};
