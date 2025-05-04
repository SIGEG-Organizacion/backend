// To-Do List for /routes/opportunityRoutes.js
// ==========================================
//
// [ ] 1. Import necessary modules:
//       - Express router
//       - Opportunity controller methods (createOpportunity, updateOpportunity, deleteOpportunity, getOpportunities, getOpportunityById, filterOpportunities)
// [ ] 2. Define the routes for opportunity-related actions:
//       - POST /create: Call the createOpportunity method from opportunityController to create a new opportunity
//       - PUT /update/:id: Call the updateOpportunity method from opportunityController to update an existing opportunity
//       - DELETE /delete/:id: Call the deleteOpportunity method from opportunityController to delete an opportunity
//       - GET /list: Call the getOpportunities method from opportunityController to retrieve a list of opportunities
//       - GET /:id: Call the getOpportunityById method from opportunityController to retrieve details of a specific opportunity
//       - GET /filter: Call the filterOpportunities method from opportunityController to filter opportunities based on criteria (e.g., remote, on-site, deadline)
// [ ] 3. Add validation middleware for incoming requests:
//       - Ensure required fields are provided (e.g., companyId, description, requirements, etc.)
//       - Validate opportunity data (deadline, description format)
//       - Validate opportunityId for updating and deleting
// [ ] 4. Add error handling for:
//       - Missing or invalid data in the request
//       - Failed operations (e.g., creating, updating, or deleting an opportunity)
//       - Opportunity or company not found
// [ ] 5. Test the routes to ensure:
//       - Creating, updating, and deleting opportunities works as expected
//       - Filtering and retrieving opportunities functions correctly
//       - Proper responses and status codes are returned on success/failure

import express from "express";
import {
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunities,
  getOpportunityById,
  filterOpportunities,
} from "../controllers/opportunityController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateOpportunity } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/create", protect, authorizeRoles("company"), validateOpportunity, createOpportunity);
router.put("/update/:id", protect, authorizeRoles("company"), validateOpportunity, updateOpportunity);
router.delete("/delete/:id", protect, authorizeRoles("company", "adminLink"), deleteOpportunity);

router.get("/list", getOpportunities);
router.get("/filter", filterOpportunities);
router.get("/:id", getOpportunityById);

export default router;
