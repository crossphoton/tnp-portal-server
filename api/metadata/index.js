const metadataRouter = require("express").Router();
const companyRouter = require("./company");
const positionRouter = require("./position");
const studentRouter = require("./student");

metadataRouter.use("/company", companyRouter);
metadataRouter.use("/positions", positionRouter);
metadataRouter.use("/students", studentRouter);

module.exports = metadataRouter;
