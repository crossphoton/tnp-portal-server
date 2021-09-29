const manager = require("express").Router();

const databaseOperationsRead = require("../src/database/operations/read");
const databaseOperationsCreate = require("../src/database/operations/create");
const databaseOperationsUpdate = require("../src/database/operations/update");

// const checker = require("../../src/utils/checker");

const checker = require("../src/utils/checker");

/* 
An authorized student who has verified its email,is verified by admin and filled its 
metadata can enroll in position he/she is eligible. 
*/
manager.post(
  "/student/enroll",
  checker({
    roles: ["STUDENT"],
    checkEmailVerified: true,
    checkMetaId: true,
    checkVerified: true,
  }),
  (req, res) => {
    if (!req.body.positionId)
      return res.status(400).json({ msg: "Position id is not provided" });

    databaseOperationsRead
      .getStudent({ id: req.user.metaId })
      .then((student) => {
        databaseOperationsUpdate
          .enrollStudentForPosition(student, { id: req.body.positionId })
          .then(() => {
            res.sendStatus(204);
          })
          .catch((err) => {
            console.log("error while enrolling for position".err);
            res.status(500).json({
              msg: `server error: ${err.message}`,
            });
          });
      })
      .catch((err) => {
        console.log("error while fetching student data while enrolling", err);
        res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);
/* 
An authorized student who has verified its email and filled its metadata can get 
positions to which he/she has enrolled

*/
manager.get(
  "/student/positions",
  checker({ roles: ["STUDENT"], checkEmailVerified: true, checkMetaId: true }),
  (req, res) => {
    databaseOperationsRead
      .getEnrollPositions({ id: req.user.metaId })
      .then((positions) => {
        return res.status(200).json({ positions });
      })
      .catch((err) => {
        console.log("error while fetching enrolled positions", err);
        res.status(500).json({
          msg: `server error: ${err.message}`,
        });
      });
  }
);

/*
An authorized company who has verified its email and filled its metadata can get
the student enrolled for purticular position created by company 
*/
manager.get(
  "/position/students",
  checker({ roles: ["COMPANY"], checkEmailVerified: true, checkMetaId: true }),
  (req, res) => {
    if (!req.query.positionId)
      return res.status(400).json({ msg: "Position Id is not provided" });
    databaseOperationsRead
      .getPosition({
        companyId: req.user["metaId"],
        id: req.query.positionId,
      })
      .then((position) => {
        if (position) {
          databaseOperationsRead
            .getEnrollStudents({ id: position.getDataValue("id") })
            .then((students) => {
              return res.status(200).json({ students });
            })
            .catch((err) => {
              console.log("error while fetching enrolled students", err);
              return res.status(500).json({
                msg: `server error: ${err.message}`,
              });
            });
        } else {
          res
            .status(401)
            .json({ msg: "Position is not registerd with your company" });
        }
      })
      .catch((err) => {
        console.log("error while fetching enrolled student", err);
      });
  }
);

module.exports = manager;
