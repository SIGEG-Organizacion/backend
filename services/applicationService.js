// To-Do List for /services/applicationService.js
// ==============================================
//
// [ ] 1. Import necessary modules:
//       - Opportunity model (from '../models/opportunityModel.js')
//       - Student model (from '../models/studentModel.js')
// [ ] 2. Create a function to apply for an opportunity:
//       - Validate the incoming data (studentId, opportunityId)
//       - Check if the student and opportunity exist in the database
//       - Add the student to the opportunity's applications array
//       - Save the updated opportunity document to the database
//       - Return a success message indicating the application was successful
// [ ] 3. Create a function to retrieve a student's applications:
//       - Validate the incoming data (studentId)
//       - Retrieve all opportunities that the student has applied to
//       - Populate the applications with opportunity details
//       - Return the list of opportunities the student has applied to
// [ ] 4. Create a function to remove a student's application from an opportunity (optional):
//       - Validate the incoming data (studentId, opportunityId)
//       - Remove the student from the opportunity's applications array
//       - Save the updated opportunity document to the database
//       - Return a success message indicating the application was removed
// [ ] 5. Add error handling for:
//       - Opportunity or student not found
//       - Invalid or missing data (e.g., missing opportunityId or studentId)
//       - Database errors
// [ ] 6. Test the functions to ensure:
//       - Applying for an opportunity correctly updates the opportunity's applications
//       - Retrieving applications for a student returns the correct data
//       - Removing an application works as expected
//       - Proper error handling provides useful feedback to the user
