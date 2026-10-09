const { Worker } = require("bullmq");

const emailWorker = new Worker(
  "email",
  async (job) => {
     console.log("Processing job:", job.id);

  throw new Error("Email provider is temporarily unavailable");
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});