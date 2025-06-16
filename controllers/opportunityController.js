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

    let logoPath = null;
    let logoKey = null;
    if (req.files?.logo?.[0]) {
      const logoFile = req.files.logo[0];
      logoKey = `logos/logo_${opportunity.uuid}_${Date.now()}${path.extname(
        logoFile.originalname
      )}`;
      await uploadLogoToB2(logoFile.path, logoKey); // Solo sube, no retorna URL
      opportunity.logoUrl = logoKey; // Guardar solo el key
      await opportunity.save();
      // Borrar archivo local
      if (logoFile.path && fs.existsSync(logoFile.path))
        fs.unlinkSync(logoFile.path);
    }
    let flyer = null;
    let flyerKey = null;
    if (req.files?.document?.[0]) {
      const docFile = req.files.document[0];
      const ext = path.extname(docFile.originalname).substring(1).toLowerCase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      flyerKey = `flyers/flyer_${opportunity.uuid}_${timestamp}.${ext}`;
      await uploadDocumentToB2(docFile, opportunity.uuid, flyerKey);
      // Borrar archivo local
      if (docFile.path && fs.existsSync(docFile.path))
        fs.unlinkSync(docFile.path);
    } else {
      flyer = await createFlyer(
        opportunity._id,
        format,
        logoKey || opportunity.logoUrl || null
      );
      flyerKey = flyer.url;
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
    // Actualizar campos básicos
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
    // Si se proporciona un nuevo logo, subirlo y actualizar logoUrl
    if (req.files?.logo?.[0]) {
      const logoFile = req.files.logo[0];
      const logoKey = `logos/logo_${uuid}_${Date.now()}${path.extname(
        logoFile.originalname
      )}`;
      const logoUrl = await uploadLogoToB2(logoFile.path, logoKey);
      updated.logoUrl = logoUrl;
      await updated.save();
    }
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
