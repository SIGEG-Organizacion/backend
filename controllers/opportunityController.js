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
import {
  uploadLogoToB2,
  uploadDocumentToB2,
  getSignedUrlFromB2,
} from "../utils/b2Uploader.js";
import { createFlyer } from "../services/flyerService.js";
import fs from "fs";
import path from "path";

export const createPublication = async (req, res, next) => {
  const {
    description,
    requirements,
    benefits,
    mode,
    deadline,
    email,
    format,
    forStudents,
  } = req.body;
  const userId = req.user._id;

  try {
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

    let logoKey = null;
    if (req.files?.logo?.[0]) {
      const logoFile = req.files.logo[0];
      logoKey = `logos/logo_${opportunity.uuid}_${Date.now()}${path.extname(
        logoFile.originalname
      )}`;
      await uploadLogoToB2(logoFile.path, logoKey);
      opportunity.logoUrl = logoKey;
      await opportunity.save();
      // No borrar el archivo local aún si se va a usar para el flyer
    }
    let flyer = null;
    let flyerKey = null;
    // Solo se permite la generación automática del flyer, no la subida de documentos
    let logoPath = null;
    if (logoKey && req.files?.logo?.[0]) {
      // Usar el archivo local subido
      console.log("Using local logo for flyer:", req.files.logo[0].path);
      logoPath = req.files.logo[0].path;
    }
    console.log("Creating flyer...");
    flyer = await createFlyer(opportunity._id, format, logoPath || null);
    flyerKey = flyer.url;
    // Limpiar logo temporal si fue descargado
    if (
      logoPath &&
      fs.existsSync(logoPath) &&
      (!req.files?.logo?.[0] || logoPath !== req.files.logo[0].path)
    ) {
      fs.unlinkSync(logoPath);
    }
    // Si el logo local fue subido, borrarlo después de usarlo
    if (req.files?.logo?.[0] && fs.existsSync(req.files.logo[0].path)) {
      fs.unlinkSync(req.files.logo[0].path);
    }
    if (flyerKey) {
      opportunity.flyerUrl = flyerKey;
      await opportunity.save();
    }
    res.status(201).json({
      message: "Opportunity created successfully",
      opportunity,
      flyer: { key: flyerKey },
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
  } = req.body || {};
  try {
    // No permitir actualización de logo en update
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
    let filter = {};
    console.log("User role:", req.user.role);
    if (req.user.role !== "adminLink" && req.user.role !== "adminTFG") {
      filter = { status: "open" };
    }
    const opportunities = await Opportunity.find(filter)
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

export const getFlyerSignedUrl = async (req, res, next) => {
  try {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ error: "Missing flyer key" });
    }
    const url = getSignedUrlFromB2(key);
    res.json({ url });
  } catch (err) {
    next(err);
  }
};
