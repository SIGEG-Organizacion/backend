import Opportunity from "../models/opportunityModel.js";
import {
  createOpportunity,
  listOpportunitiesWithName,
  updateOpportunityFields,
  deleteOpportunity as deleteOpportunityService,
  getOpportunityService,
  createFlyer,
  getOpportunitiesFiltered,
} from "../services/opportunityService.js";

export const createPublication = async (req, res, next) => {
  const { description, requirements, benefits, mode, deadline, email, format, forStudents } = req.body;
  const userId = req.user._id;
  let createdOpportunityId = null;

  try {
    // Verificar la creación de la oportunidad
    const opportunity = await createOpportunity(
      userId, description, requirements, benefits, mode, deadline, email, forStudents
    );

    createdOpportunityId = opportunity._id;

    // Obtener el logo desde el formulario y cargarlo
    const logoFile = req.files.logo;
    const logoUrl = await uploadLogoToB2(logoFile.tempFilePath, `logos/${logoFile.name}`);

    // Almacenar el logo en la oportunidad
    opportunity.logoUrl = logoUrl;
    await opportunity.save();

    // Crear el flyer con el logo y asociarlo a la oportunidad
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
    await Opportunity.findByIdAndDelete(createdOpportunityId);
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
