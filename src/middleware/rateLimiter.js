

const rateLimiter = async (req, res, next) => {
  const key = `rate:user:${req.user.id}`;

  const count = await redisClient.incr(key); // Increment the request count for this user

  if (count === 1) {// If this is the first request, set an expiration time for the key
    await redisClient.expire(key, 60); // Set the expiration time to 60 seconds for the first request
  }

  if (count > 100) { // Limit to 100 requests per minute
    return res.status(429).json({
      message: "Too many requests",
    });
  }

  next();
};