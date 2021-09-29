const handleData = require("express").Router();

const databaseOperationsRead = require("../src/database/operations/read"),
  databaseOperationsCreate = require("../src/database/operations/create"),
  databaseOperationsUpdate = require("../src/database/operations/update");

/* 
  An authorized company who has verified its email and has not filled its metadata can store its metadata.
*/
handleData.post("/company", async (req, res) => {
  if (req.user && req.user.type === "COMPANY") {
    databaseOperationsRead
      .getUserWithUsername(req.user.username)
      .then((user) => {
        if (
          user.getDataValue("emailVerified") &&
          !user.getDataValue("metaId")
        ) {
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
            return res.status(400).json({ msg: "Invalid Body" });

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
                    msg: "Unable to store data. Please try again after some time.",
                  });
                });
            })
            .catch((err) => {
              console.log("Error while saving company data: ", err);
              return res.status(500).json({
                msg: "Unable to store data. Please try again after some time",
              });
            });
        } else {
          return res.status(405).json({ msg: "Method Not Allowed" });
        }
      })
      .catch((err) => {
        console.log("unable to get user type company while storing", err);
        return res.status(500).json({
          msg: "Unable to store company data. Please try again after some time",
        });
      });
  } else {
    res.status(400).json({ msg: "Unauthorized access" });
  }
});
/*
  An authorized company who has verified its email and has filled its metadata can create position to hire student
*/
handleData.post("/position", async (req, res) => {
  if (req.user && req.user.type == "COMPANY") {
    databaseOperationsRead
      .getUserWithUsername(req.user.username)
      .then((company) => {
        if (
          company.getDataValue("emailVerified") &&
          company.getDataValue("metaId")
        ) {
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
          } = req.body;

          if (
            !name ||
            !description ||
            !type ||
            !pocName ||
            !pocEmail ||
            !pocPhone
          )
            return res.status(400).json({ msg: "invalid body" });

          let companyId = company.getDataValue("metaId");
          const position = {
            companyId,
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
          };

          databaseOperationsCreate
            .createPosition(position)
            .then((_newPosition) => {
              res.sendStatus(204);
            })
            .catch((err) => {
              console.log("error while storing new position", err);
              res.status(500).json({
                msg: "Unable to create new position. Please try again after some time",
              });
            });
        } else {
          res.status(405).json({ msg: "Method not allowed" });
        }
      })
      .catch((err) => {
        console.log("unable to get user type company while storing", err);
        return res.status(500).json({
          msg: "Unable to store  positions. Please try again after some time",
        });
      });
  } else {
    res.status(400).json({ msg: "Unauthorized access" });
  }
});

/* 
 An authorized company who has verified its email and has filled its metadata once can update its metadata anytime
*/
//TODO: to test
handleData.put("/company", (req, res) => {
  if (req.user && req.user.type == "COMPANY") {
    databaseOperationsRead
      .getUserWithUsername(req.user.username)
      .then((user) => {
        if (user.getDataValue("emailVerified") && user.getDataValue("metaId")) {
          if (!req.body.change)
            return res.status(400).json({ msg: "invalid body" });

          databaseOperationsUpdate
            .updateCompany(req.body.change, { id: user.getDataValue("metaId") })
            .then(() => {
              res.sendStatus(204);
            })
            .catch((err) => {
              console.log("error while updating company data", err);
              res
                .status(500)
                .json({
                  msg: "Unable to update data. Please Try again after some time",
                });
            });
        } else {
          res.status(405).json({ msg: "Method not allowed" });
        }
      })
      .catch((err) => {
        console.log("unable to get user type company while storing", err);
        return res.status(500).json({
          msg: "Unable to update company data. Please try again after some time",
        });
      });
  } else {
    res.status(400).json({ msg: "Unauthorized access" });
  }
});

/* 
  An authorized company who has verified its email and has filled its metadata can update position created 
  by it anytime
*/
handleData.put("/position", (req, res) => {
  if (req.user && req.user.type == "COMPANY") {
    databaseOperationsRead
      .getUserWithUsername(req.user.username)
      .then((user) => {
        if (user.getDataValue("emailVerified") && user.getDataValue("metaId")) {
          const { positionId, change } = req.body;

          if (!positionId || !change)
            return res.status(400).json({ msg: "invalid body" });

          databaseOperationsUpdate
            .updatePosition(change, {
              id: positionId,
              companyId: user.getDataValue("metaId"),
            })
            .then(() => {
              res.sendStatus(204);
            })
            .catch((err) => {
              console.log("error while updating position", err);
              res
                .status(500)
                .json({
                  msg: "Unable to update data. Please Try again after some time",
                });
            });
        } else {
          res.status(405).json({ msg: "Method not allowed" });
        }
      })
      .catch((err) => {
        console.log(
          "unable to get user type company while updating position",
          err
        );
        return res.status(500).json({
          msg: "Unable to update position. Please try again after some time",
        });
      });
  } else {
    res.status(400).json({ msg: "Unauthorized access" });
  }
});

/* 
An authorized company who has verified its email and has filled its metadata can 
get all its data.
An authorized student poc who has verified its email and has filled its metadata  can get all the data of company to which he/she assigned poc.
An authorized student who has verified its email and has filled its metadata can get all the regisred company with some restricted data.
*/
handleData.get("/comapny", (req, res) => {
  if (req.user) {
    databaseOperationsRead
      .getUserWithUsername(req.user.username)
      .then((user) => {
        if (user.getDataValue("emailVerified") && user.getDataValue("metaId")) {
          let attributes, filter;
          if (req.user.type == "COMPANY" || req.user.type == "STUDENTPOC")
            attributes = [
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
            ];
          else
            attributes = [
              "name",
              "address",
              "phone",
              "website",
              "category",
              "sector",
            ];

          if (req.user.type == "COMPANY") {
            filter = {
              id: user.getDataValue("metaId"),
            };
          } else if (req.user.type == "STUDENTPOC") {
            filter = {
              studentPocId: user.getDataValue("metaId"),
            };
          } else {
            filter = {};
          }

          databaseOperationsRead
            .getAllCompany(filter, attributes)
            .then((company) => {
              res.status(200).json(company);
            })
            .catch((err) => {
              console.log("error while getting company data", err);
              res
                .status(500)
                .json({
                  msg: "Unable to fetch data. Please Try again after some time",
                });
            });
        } else {
          res.status(405).json({ msg: "Method not allowed" });
        }
      })
      .catch((err) => {
        console.log("unable to get user type while fetching data", err);
        return res.status(500).json({
          msg: "Unable to fetch data. Please try again after some time",
        });
      });
  } else {
    res.status(400).json({ msg: "Unauthorized access" });
  }
});
/*
  An authorized company verified its email and filled its metadata can get all 
  the positions created by it 
*/
handleData.get("/position", (req, res) => {
  if (req.user) {
    databaseOperationsRead
      .getUserWithUsername(req.user.username)
      .then((user) => {
        if (user.getDataValue("emailVerified") && user.getDataValue("metaId")) {
          if (req.user.type == "COMPANY") {
            databaseOperationsRead
              .getAllPositions({ companyId: user.getDataValue("metaId") }, [
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
              ])
              .then((positions) => {
                res.status(200).json({ positions });
              })
              .catch((err) => {
                console.log("error while getting positions", err);
                res
                  .status(500)
                  .json({
                    msg: "Unable to fetch data. Please Try again after some time",
                  });
              });
          } else if (req.user.type == "STUDENT") {
            databaseOperationsRead
              .getPositionsForStudent({ id: user.getDataValue("metaId") }, [
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
              ])
              .then((positions) => {
                res.status(200).json({ positions });
              })
              .catch((err) => {
                console.log("error while fetching positions for student", err);
                res
                  .status(500)
                  .json({
                    msg: "Unable to fetch positions. Please Try again after some time",
                  });
              });
          }
        } else {
          res.status(405).json({ msg: "Method not allowed" });
        }
      })
      .catch((err) => {
        console.log("unable to get user type  while fetching positions", err);
        return res.status(500).json({
          msg: "Unable to fetch data. Please try again after some time",
        });
      });
  } else {
    res.status(400).json({ msg: "Unauthorized access" });
  }
});

/* 
  An authorized company who has verified its email and filled its meta data can get its student poc.
  If student poc is not assigned an empty json is sent.
*/

handleData.get("/getMyPOC", (req, res) => {
  if (req.user && req.user.type == "COMPANY") {
    databaseOperationsRead
      .getUserWithUsername(req.user.username)
      .then((user) => {
        if (user.getDataValue("emailVerified") && user.getDataValue("metaId")) {
          databaseOperationsRead
            .getCompany({ id: user.getDataValue("metaId") }, ["studentPocId"])
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
                    res
                      .status(500)
                      .json({
                        msg: "Unable to get student poc. Please try agin after sometime",
                      });
                  });
              } else {
                res.status(200).json({});
              }
            })
            .catch((err) => {
              console.log("error while fetching student poc", err);
              res
                .status(500)
                .json({
                  msg: "Unable to fetch data. Please Try again after some time",
                });
            });
        } else {
          res.status(405).json({ msg: "Method not allowed" });
        }
      })
      .catch((err) => {
        console.log(
          "unable to get user type company while fetchin student poc",
          err
        );
        return res.status(500).json({
          msg: "Unable to fetch student poc. Please try again after some time",
        });
      });
  } else {
    res.status(400).json({ msg: "Unauthorized access" });
  }
});

//TODO: add put request for students

module.exports = handleData;
