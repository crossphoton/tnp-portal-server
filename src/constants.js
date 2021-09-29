// Roles
const STUDENT_ROLE = "STUDENT";
const COMPANY_ROLE = "COMPANY";
const STUDENT_POC_ROLE = "STUDENT_POC";
const ROLES = [STUDENT_ROLE, COMPANY_ROLE, STUDENT_POC_ROLE];

const VERIFIED_EMAIL_ATTRIBUTE = "emailVerified";
const META_ID_ATTRIBUTE = "metaId";
const VERIFIED_ATTRIBUTE = "verified";

// Attributes list
const STUDENT_ATTRIBUTED_ALLOWED_TO_GET = [
  "fName",
  "lName",
  "roll",
  "department",
  "year",
  "email",
  "phone",
  "address",
  "cgpa",
  "semTillCGPA",
  "resume",
  "verified",
];
const COMPANY_ATTRIBUTED_ALLOWED_TO_GET = [
  "name",
  "address",
  "phone",
  "website",
  "category",
  "sector",
  "mainPOCName",
  "mainPOCPhone",
  "mainPOCEmail",
  "mainPOCPosition",
  "verified",
];

const ROLE_TO_MODEL = {
  [STUDENT_ROLE]: "student",
  [STUDENT_POC_ROLE]: "student_poc",
  [COMPANY_ROLE]: "company",
  POSITION: "position",
  USER: "users",
};

module.exports = {
  STUDENT_ROLE,
  COMPANY_ROLE,
  STUDENT_POC_ROLE,
  ROLES,
  VERIFIED_EMAIL_ATTRIBUTE,
  META_ID_ATTRIBUTE,
  VERIFIED_ATTRIBUTE,
  STUDENT_ATTRIBUTED_ALLOWED_TO_GET,
  COMPANY_ATTRIBUTED_ALLOWED_TO_GET,
  ROLE_TO_MODEL,
};
