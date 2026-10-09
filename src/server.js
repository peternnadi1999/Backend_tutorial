require("dotenv").config();

const app = require("./app");
const { connectRedis } = require("./db/redis");

const PORT = 3000;

const startServer = async () => {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();