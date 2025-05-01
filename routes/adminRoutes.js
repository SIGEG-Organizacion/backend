// To-Do List for /routes/adminRoutes.js
// =====================================
//
// [ ] 1. Import necessary modules:
//       - Express router
//       - Admin controller methods (approveUser, generateReport, getAllUsers, getReports)
// [ ] 2. Define the routes for admin-related actions:
//       - POST /approve-user/:id: Call the approveUser method from adminController to approve a user (by userId)
//       - GET /reports: Call the getReports method from adminController to retrieve all generated reports
//       - POST /generate-report: Call the generateReport method from adminController to generate a new report (e.g., applications, user activities)
//       - GET /users: Call the getAllUsers method from adminController to retrieve all users in the system
// [ ] 3. Add validation middleware for incoming requests:
//       - Ensure proper admin authentication (via JWT token)
//       - Validate report type and userId for approval
// [ ] 4. Add error handling for:
//       - Invalid or missing data (userId for approving, report data)
//       - Failed operations (e.g., user not found, report generation errors)
// [ ] 5. Test the routes to ensure:
//       - User approval works as expected (status update)
//       - Report generation and retrieval functions as expected
//       - Admin can view all users and reports successfully
