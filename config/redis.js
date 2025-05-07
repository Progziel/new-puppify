const Redis = require("ioredis");
const logger = require("../utils/logger");

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

const redisClient = new Redis(redisConfig);
const pubClient = new Redis(redisConfig);
const subClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});
redisClient.on('error', (err) => {
  logger.error('Redis client error:', err.message);
});

pubClient.on('connect', () => {
  logger.info('Redis pubClient connected');
});
pubClient.on('error', (err) => {
  logger.error('Redis pubClient error:', err.message);
});

subClient.on('connect', () => {
  logger.info('Redis subClient connected');
});
subClient.on('error', (err) => {
  logger.error('Redis subClient error:', err.message);
});

module.exports = { redisClient, pubClient, subClient };