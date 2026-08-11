const express = require("express");
const logger = require("./middleware/logger.js");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(express.json());
app.use(logger);

app.use(userRoutes);

module.exports = app;