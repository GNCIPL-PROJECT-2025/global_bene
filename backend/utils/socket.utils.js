import { RedisAdapter } from "socket.io-redis";
import { createClient } from "redis";

// Create Redis clients
const pubClient = createClient({ host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 });
const subClient = pubClient.duplicate();

// Handle Redis connection errors
pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error:', err));

// Create and export the adapter
export const getRedisAdapter = () => {
    return new RedisAdapter(pubClient, subClient);
};