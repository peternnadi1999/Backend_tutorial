const express = require("express");
const logger = require("./middleware/logger.js");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");

const app = express();

app.use(express.json());
app.use(logger);

app.use(userRoutes);
app.use(authRoutes);
app.use(postRoutes);

module.exports = app;