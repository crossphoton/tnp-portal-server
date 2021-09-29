const companyRouter = require("express").Router();

const databaseOperationsCreate = require("../../src/database/operations/create"),
  databaseOperationsRead = require("../../src/database/operations/read"),
  databaseOperationsUpdate = require("../../src/database/operations/update");

const constants = require("../../src/constants");
const checker = require("../../src/utils/checker");

/**
  An authorized company who has verified its email and has not filled its metadata can
   store its metadata.
*/
companyRouter.post(
  "/",
  checker({ roles: [constants.COMPANY_ROLE], checkEmailVerified: true }),
  async (req, res) => {
    if (req.User.metaId)
      return res.status(405).send({ msg: "Profile already created." });
    const {
      name,
      address,
      phone,
      website,
      category,
      sector,
      mainPOCName,
      mainPOCPhone,
      mainPOCEmail,
      mainPOCPosition,
    } = req.body;

    if (
      !name ||
      !website ||
      !sector ||
      !category ||
      !mainPOCName ||
      !mainPOCPhone ||
      !mainPOCPosition
    )
      return res.status(400).json({ msg: "Please fill all the details" });

    const company = {
      name,
      address,
      phone,
      website,
      category,
      sector,
      mainPOCName,
      mainPOCPhone,
      mainPOCEmail,
      mainPOCPosition,
    };

    databaseOperationsCreate
      .createCompany(company)
      .then((createdCompany) => {
        let metaId = createdCompany.getDataValue("id");
        databaseOperationsUpdate
          .updateUser({ metaId }, { username: req.user.username })
          .then(() => {
            return res.sendStatus(204);
          })
          .catch((err) => {
            console.log("Error while updating meta Id: ", err);
            return res.status(500).json({
              msg: `server error: ${err.message}`,
            });
          });
      })
      .catch((err) => {
        console.log("Error while saving company data: ", err);
        return res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);

/**
 An authorized company who has verified its email and has filled its metadata once can 
 update its metadata anytime
*/
//TODO: to test
companyRouter.put(
  "/",
  checker({
    roles: [constants.COMPANY_ROLE],
    checkEmailVerified: true,
    checkMetaId: true,
  }),
  (req, res) => {
    if (!req.body.change)
      return res
        .status(400)
        .json({ msg: "Data to be updated is not provided" });

    req.body.change.verified = false;
    databaseOperationsUpdate
      .updateCompany(req.body.change, { id: req.user.metaId })
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log("error while updating company data", err);
        res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);

/**
An authorized company who has verified its email and has filled its metadata can 
get all its data.
An authorized student poc who has verified its email and has filled its metadata  can get all the data of company to which he/she assigned poc.
An authorized student who has verified its email and has filled its metadata can get all the registered company with some restricted data.
*/
companyRouter.get(
  "/",
  checker({
    roles: constants.ROLES,
    checkEmailVerified: true,
    checkMetaId: true,
  }),
  (req, res) => {
    let attributes, filter;
    if (req.user.type == "COMPANY" || req.user.type == "STUDENTPOC")
      attributes = constants.COMPANY_ATTRIBUTED_ALLOWED_TO_GET;
    else
      attributes = [
        "name",
        "address",
        "phone",
        "website",
        "category",
        "sector",
      ];

    if (req.user.type === "COMPANY") {
      filter = {
        id: req.user.metaId,
      };
    } else if (req.user.type === "STUDENTPOC") {
      filter = {
        studentPocId: req.user.metaId,
      };
    } else {
      filter = {};
    }

    databaseOperationsRead
      .getAllCompany(filter, attributes)
      .then((company) => {
        res.status(200).json({ company });
      })
      .catch((err) => {
        console.log("error while getting company data", err);
        res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);

//TODO: To test
/**
  An authorized company who has verified its email and filled its meta data can get its student poc.
  If student poc is not assigned an empty json is sent.
*/
companyRouter.get(
  "/poc",
  checker({
    roles: [constants.COMPANY_ROLE],
    checkEmailVerified: true,
    checkMetaId: true,
  }),
  (req, res) => {
    databaseOperationsRead
      .getCompany({ id: req.user.metaId }, ["studentPocId"])
      .then((company) => {
        let studentPocId = company.getDataValue("studentPocId");
        if (studentPocId) {
          databaseOperationsRead
            .getStudentPOC({ id: studentPocId }, [
              "fName",
              "lName",
              "phone",
              "email",
              "department",
            ])
            .then((studentPOC) => {
              res.status(200).json(studentPOC);
            })
            .catch((err) => {
              console.log("error while fetching student poc", err);
              res.status(500).json({
                msg: `server error: ${err.message}`,
              });
            });
        } else {
          res.status(200).json({});
        }
      })
      .catch((err) => {
        console.log("error while fetching student poc", err);
        res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);

module.exports = companyRouter;
