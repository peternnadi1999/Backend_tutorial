const emailQueue = require("./src/queues/email.queue");

const addJob = async () => {
	const job = await emailQueue.add(
		"welcome-email",
		{
			email: "peter@example.com",
			name: "Peter",
		},
		{
			// number of attempts and backoff strategy for retrying failed jobs
			attempts: 3,
			backoff: {
				type: "exponential",
				delay: 1000,
			},
			removeOnComplete: true, // remove job from queue when completed
			removeOnFail: false, // keep failed jobs in the queue for inspection
		},
	);
	console.log("Job added:", job.id);
};

addJob();
