const { Queue } = require("bullmq");

//create a new queue for sending emails
const emailQueue = new Queue("email", { 
  connection: {
    host: "localhost",
    port: 6379,
  },  // connection details for Redis server
});

module.exports = emailQueue;