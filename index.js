require("dotenv").config({
  path: `${__dirname}/${process.env.ENV || "config/.env"}`,
});
const api = require("./api/init");
const source = require("./src/init");

api.init();
source.init();

process.on("SIGINT" || "SIGTERM", () => {
  console.log("Starting shutdown sequence...");
  source.shutdown();
  api.shutdown();
  console.log("Shutting down...");
  process.exit(1);
});
