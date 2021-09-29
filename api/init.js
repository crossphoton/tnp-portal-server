const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const expressSanitizer = require("express-sanitizer");
const { OpenApiValidator } = require("express-openapi-validate");
const jsYaml = require("js-yaml");
const fs = require("fs");
const loginRouter = require("./user");
const metadataRouter = require("./metadata");
const managerRouter = require("./manager");
const http = require("http");
const { checkAndSetUser } = require("../src/users/session");
const checker = require("../src/utils/checker");
const rateLimiter = require("../src/utils/ratelimiting");

/** @type {http.Server} */ var server;

const openApiDocument = jsYaml.load(
  fs.readFileSync("config/openapi.yaml", "utf-8")
);

const validator = new OpenApiValidator(openApiDocument);

function init() {
  // Start API server
  const port = process.env.PORT || 3000;

  server = app.listen(port, () => {
    console.log("Listening on port %d", port);
  });

  // Middleware
  app.options("*", cors());
  app.use(express.json());

  // Security middleware
  app.use(helmet());
  //   app.use(expressSanitizer());
  //   if (process.env.TNP_PORTAL_OPENAPI_CHECK == "true")
  //     app.use(validator.match());
  app.use(rateLimiter);

  app.use(function (req, res, next) {
    res.setHeader("X-Maintainer", "crossphoton");
    res.setHeader("Accepts", "application/json");
    res.setHeader("Content-type", "application/json");

    next();
  }, checkAndSetUser);
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://tnp.iiitr.ac.in",
        "http://localhost:8080",
        "https://tnp-dev.vercel.app",
        "https://tnp-iiitr.vercel.app",
        "https://tnp-portal-frontend.vercel.app",
      ],
    })
  );

  // Add routes
  app.use("/users", loginRouter);
  app.use("/metadata", metadataRouter);
  app.use("/manager", managerRouter);

  app.get("/_health", (req, res) => {
    res.status(200).json({ msg: "ok" });
  });

  app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      msg: err.message,
    });
  });
}

// Graceful shutdown
function shutdown() {
  console.log("Stopping API server");
  server.close();
}

module.exports = { init, shutdown };
