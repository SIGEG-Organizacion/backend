//controllers/opportunityController.js
import Opportunity from "../models/opportunityModel.js";
import {
  createOpportunity,
  listOpportunitiesWithName,
  updateOpportunityFields,
  deleteOpportunity as deleteOpportunityService,
  getOpportunityService,
  getOpportunitiesFiltered,
} from "../services/opportunityService.js";
import { uploadLogoToB2 } from "../utils/b2Uploader.js";
import { createFlyer } from "../services/flyerService.js";
import fs from 'fs';  

export const createPublication = async (req, res, next) => {
  const { description, requirements, benefits, mode, deadline, email, format, forStudents } = req.body;

  // Log para verificar el valor de forStudents
  console.log("Received forStudents:", forStudents);
  const userId = req.user._id;
  
  try {
    // Crear la oportunidad
    const opportunity = await createOpportunity(
      userId,
      description,
      requirements,
      benefits,
      mode,
      deadline,
      email,
      forStudents 
    );
    
    // Lógica para procesar el logo si se ha adjuntado
    let logoUrl = null;
    if (req.file) {
      const logoFile = req.file;
      logoUrl = await uploadLogoToB2(logoFile.path, `logos/${logoFile.filename}`);

      // Eliminar archivo temporal después de subirlo
      fs.unlinkSync(logoFile.path); // Elimina el archivo temporal local

      // Guardar la URL del logo en la oportunidad
      opportunity.logoUrl = logoUrl;
      await opportunity.save();
    }

    const flyer = await createFlyer(opportunity._id, format, logoUrl);

    // Guardar la URL del flyer en la oportunidad
    opportunity.flyerUrl = flyer.url;
    await opportunity.save();

    res.status(201).json({
      message: "Opportunity created successfully",
      opportunity,
      flyer,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOpportunity = async (req, res, next) => {
  const { uuid } = req.params;
  const {
    description,
    requirements,
    benefits,
    mode,
    deadline,
    email,
    status,
    forStudents,
  } = req.body;
  try {
    const updated = await updateOpportunityFields(
      uuid,
      description,
      requirements,
      benefits,
      mode,
      deadline,
      email,
      status,
      forStudents
    );
    res.status(200).json({
      message: "Opportunity updated successfully",
      opportunity: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteOpportunity = async (req, res, next) => {
  const { uuid } = req.params;
  try {
    const result = await deleteOpportunityService(uuid);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getOpportunitiesByCompany = async (req, res, next) => {
  const { company_name } = req.query;
  try {
    const opportunities = await listOpportunitiesWithName(company_name);
    res.status(200).json({ opportunities });
  } catch (err) {
    next(err);
  }
};

export const getOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find()
      .populate({
        path: "companyId",
        select: "address sector -_id",
        populate: { path: "userId", select: "name -_id" },
      })
      .select("-_id");
    res.status(200).json({ opportunities });
  } catch (err) {
    next(err);
  }
};

export const getOpportunity = async (req, res, next) => {
  const { uuid } = req.params;
  try {
    const opportunity = await getOpportunityService(uuid);
    res.status(200).json({ opportunity });
  } catch (err) {
    next(err);
  }
};

export const filterOpportunities = async (req, res, next) => {
  const { mode, from, to, sector } = req.query;
  try {
    const opportunities = await getOpportunitiesFiltered(
      mode,
      from,
      to,
      sector
    );
    res.status(200).json({ opportunities });
  } catch (err) {
    next(err);
  }
};
