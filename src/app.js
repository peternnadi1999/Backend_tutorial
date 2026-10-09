const express = require("express");
const logger = require("./middleware/logger.js");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const activityRoutes = require("./routes/activity.routes");
const errorHandler = require("./middleware/errorHandler.js");
const cookieParser = require("cookie-parser");
const rateLimiter = require("./middleware/rateLimiter.js");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(logger);
app.use(rateLimiter);

app.use(userRoutes);
app.use(authRoutes);
app.use(postRoutes);
app.use("/api", activityRoutes);


app.use(errorHandler);
module.exports = app;