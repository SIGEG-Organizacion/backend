import { body, param } from "express-validator";

// Common validations
export const emailValidator = body("email")
  .notEmpty()
  .isEmail()
  .withMessage("Please provide a valid email")
  .normalizeEmail();

export const passwordValidator = body("password")
  .notEmpty()
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Password must contain at least one symbol")
  .trim();

export const phoneValidator = body("phone_number")
  .notEmpty()
  .matches(/^\+(?:[0-9] ?){6,14}[0-9]$/)
  .withMessage("Please provide a valid international phone number");

export const roleValidator = body("role")
  .notEmpty()
  .isIn(["student", "company", "adminTFG", "adminLink", "graduate"])
  .withMessage("Invalid role");

export const actionValidator = body("action")
  .notEmpty()
  .isIn(["validate", "delete", "invalidate"])
  .withMessage("Invalid action");

export const nameValidator = body("name")
  .notEmpty()
  .withMessage("Name is required")
  .matches(/^[A-Za-z\u00C0-\u017F\s'-]+$/)
  .withMessage(
    "Name must contain only letters, spaces, hyphens, and apostrophes"
  )
  .trim()
  .escape();

const majorValidator = body("major")
  .notEmpty()
  .isIn([
    "ARH",
    "AEN",
    "MRN",
    "DP",
    "GPM",
    "DCS",
    "CND",
    "IMT",
    "ATI",
    "DAI",
    "DDE",
    "ET",
    "EM",
    "EMA",
    "AU",
    "AE",
    "AIT",
    "AA",
    "AN",
    "BI",
    "ME",
    "CI",
    "ECE",
    "CS",
    "SCC",
    "CD",
    "FI",
    "EIC",
    "MI",
    "CA",
    "CES",
    "CO",
    "E",
    "EMT",
    "PI",
    "SHO",
    "MA",
    "QU",
    "DI",
    "IA",
    "AG",
    "FO",
    "FH",
    "GTR",
    "GTS",
    "GST",
    "AAL",
    "AMB",
    "IB",
    "IDC",
    "IM",
    "DIL",
    "AEL",
    "EML",
    "LEM",
    "IAL",
    "AGL",
    "COL",
    "EL",
    "MIL",
    "MEL",
    "PIL",
    "SOL",
    "FOL",
    "IBL",
    "AEM",
    "MCS",
    "DE",
    "MIM",
    "MQT",
    "MCT",
    "FOM",
    "MC",
    "DEL",
    "MDM",
    "ETM",
    "ELM",
    "MIV",
    "MIE",
    "SOM",
    "PIM",
    "MCA",
    "PCA",
    "PCS",
    "SP",
    "IF",
    "CDC",
    "CDD",
    "DVE",
  ])
  .withMessage("Invalid major");

const admissionYearValidator = body("admissionYear")
  .notEmpty()
  .withMessage("Name is required")
  .isInt({ min: 2010, max: 4000 });

export const validateCreateUser = [
  nameValidator,
  passwordValidator,
  phoneValidator,
  roleValidator,
];

export const validateCreateStudent = [
  emailValidator,
  admissionYearValidator,
  majorValidator,
];

export const validateCreateCompany = [
  body("sector").notEmpty().withMessage("Sector is required"),
  body("address").notEmpty().withMessage("Adress is required"),
];

export const validateLogin = [emailValidator];
export const validateGenerateNewToken = [emailValidator];
export const validateResetPassword = [
  body("token").notEmpty().withMessage("Token is required"),
  passwordValidator,
];
export const validateTokenParam = [
  param("token").notEmpty().withMessage("Token is required"),
];

export const validateUserAcces = [emailValidator, actionValidator];

export const validateUpdateUser = [
  emailValidator.optional(),
  phoneValidator.optional(),
  majorValidator.optional(),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("logo").optional().isURL().withMessage("Logo must be a valid URL"),
];
