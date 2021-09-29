const positionRouter = require("express").Router();

const databaseOperationsCreate = require("../../src/database/operations/create"),
  databaseOperationsRead = require("../../src/database/operations/read"),
  databaseOperationsUpdate = require("../../src/database/operations/update"),
  databaseOperationsDelete = require("../../src/database/operations/delete");

const checker = require("../../src/utils/checker");
const constants = require("../../src/constants");

/*
  An authorized company who has verified its email,is verified by admin and has filled its metadata can create
   position to hire student
*/
positionRouter.post(
  "/",
  checker({
    roles: [constants.COMPANY_ROLE],
    checkEmailVerified: true,
    checkMetaId: true,
    checkVerified: true,
  }),
  async (req, res) => {
    const {
      name,
      description,
      type,
      hires,
      duration,
      location,
      salary,
      ppoAvailable,
      status,
      minCGPA,
      pocName,
      pocPhone,
      pocEmail,
      forBatch,
    } = req.body;

    if (
      !name ||
      !description ||
      !type ||
      !pocName ||
      !pocEmail ||
      !pocPhone ||
      !forBatch
    )
      return res.status(400).json({ msg: "Please fill all the data." });

    let companyId = req.user.metaId;
    let company = await databaseOperationsRead.getCompany({ id: companyId }, [
      "name",
    ]);
    const position = {
      companyId,
      name,
      description,
      type,
      companyName: company.name,
      hires,
      duration,
      location,
      salary,
      ppoAvailable,
      status,
      minCGPA,
      pocName,
      pocPhone,
      pocEmail,
      forBatch,
    };

    databaseOperationsCreate
      .createPosition(position)
      .then((_newPosition) => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log("error while storing new position", err);
        res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);

/* 
  An authorized company who has verified its email and has filled its metadata can update position created 
  by it anytime
*/
positionRouter.put(
  "/",
  checker({
    roles: [constants.COMPANY_ROLE],
    checkEmailVerified: true,
    checkMetaId: true,
  }),
  (req, res) => {
    const { positionId, change } = req.body;

    if (!positionId || !change)
      return res
        .status(400)
        .json({ msg: "PositionId or Data to be updated is not provided" });

    databaseOperationsUpdate
      .updatePosition(change, {
        id: positionId,
        companyId: req.user.metaId,
      })
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log("error while updating position", err);
        res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);

//TODO: to test
/*
  An authorized company whos has verified its email and filled its metadata can get all 
  the positions created by it 
  An authorized student poc can get poc of position created by company to which he/she
   assigned student poc
  An authorized student who has verified its email and filled its metadata can get 
  positions for which he/she is eligible.
*/
positionRouter.get(
  "/",
  checker({
    roles: constants.ROLES,
    checkEmailVerified: true,
    checkMetaId: true,
  }),
  (req, res) => {
    let filter;
    if (req.user.type == constants.COMPANY_ROLE)
      filter = {
        companyId: req.user.metaId,
      };
    else if (req.user.type === constants.STUDENT_POC_ROLE) {
      if (!req.body.companyId)
        return res.status(400).json({ msg: "CompanyId is not provided" });
      else
        filter = {
          companyId: req.body.companyId,
        };
    }
    if (
      req.user.type == constants.COMPANY_ROLE ||
      req.user.type == constants.STUDENT_POC_ROLE
    ) {
      databaseOperationsRead
        .getAllPositions(filter, [
          "id",
          "name",
          "description",
          "type",
          "hires",
          "duration",
          "location",
          "salary",
          "ppoAvailable",
          "status",
          "minCGPA",
          "pocName",
          "pocPhone",
          "pocEmail",
          "forBatch",
          "verified",
          "companyName",
        ])
        .then((positions) => {
          res.status(200).json({ positions });
        })
        .catch((err) => {
          console.log("error while getting positions", err);
          res.status(500).json({
            msg: `server error: ${err.message}`,
          });
        });
    } else if (req.user.type == "STUDENT") {
      databaseOperationsRead
        .getPositionsForStudent({ id: req.user.metaId }, [
          "id",
          "name",
          "description",
          "type",
          "hires",
          "duration",
          "location",
          "salary",
          "ppoAvailable",
          "status",
          "minCGPA",
          "companyName",
        ])
        .then((positions) => {
          res.status(200).json({ positions });
        })
        .catch((err) => {
          console.log("error while fetching positions for student", err);
          res.status(500).json({
            msg: `server error: ${err.message}`,
          });
        });
    }
  }
);

/* An authorized company who has verified email and filled its meta data can delete
 position created by it 
 */
positionRouter.delete(
  "/",
  checker({ roles: ["COMPANY"], checkEmailVerified: true, checkMetaId: true }),
  (req, res) => {
    if (!req.body.positionId)
      return res.status(400).json({ msg: "Position's ID is not provided" });
    databaseOperationsDelete
      .deletePosition({ companyId: req.user.metaId, id: req.body.positionId })
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log("error while getting deleting  position", err);
        res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);

module.exports = positionRouter;
