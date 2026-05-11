require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const chatRoutes = require('./routes/chat.routes');

const { socketHandler } = require('./sockets/socket');
const seedAdmin = require('./utils/seedAdmin');
const seedUser = require('./utils/seedUser');

const app = express(); // Create HTTP server for Socket.IO to attach to
const server = http.createServer(app);


// Initialize Socket.IO server with CORS settings  socket server created 
//frontend will connect to this server and exchange data in real time
//frontend will emit events like 'user:join' and 'admin:join' to join specific rooms for targeted notifications and messages
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});


const redisUrl = process.env.REDIS_URL;
let pubClient;  //message publisher client for Socket.IO Redis adapter
let subClient;  //message subscriber client for Socket.IO Redis adapter(Receiver)
let redisAdapterEnabled = false;


// Function to attach Redis adapter once both clients are ready
const attachRedisAdapter = () => {
  if (!redisAdapterEnabled && pubClient && subClient) {
    io.adapter(createAdapter(pubClient, subClient));
    redisAdapterEnabled = true;
    console.log('Socket.IO Redis adapter attached');
  }
};


// If Redis URL is configured, set up Redis clients and attach adapter for scaling Socket.IO across multiple server instances
if (redisUrl) {
  pubClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    }
  });

  //
  subClient = pubClient.duplicate();

  const handleRedisError = (err) => {
    console.error('Redis client error:', err.message || err);
  };

  const handleRedisReady = () => {
    if (pubClient.status === 'ready' && subClient.status === 'ready') {
      attachRedisAdapter();
    }
  };

  pubClient.on('error', handleRedisError);
  subClient.on('error', handleRedisError);
  pubClient.on('ready', handleRedisReady);
  subClient.on('ready', handleRedisReady);
  pubClient.on('connect', () => console.log('Redis pubClient connected'));
  subClient.on('connect', () => console.log('Redis subClient connected'));

  pubClient.on('end', () => {
    if (!redisAdapterEnabled) {
      console.warn('Redis connection ended before adapter attachment. Running without Redis adapter.');
    }
  });
} else {
  console.log('REDIS_URL is not configured. Socket.IO will run without Redis adapter.');
}

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected');

  // Seed default admin and user credentials if not present

  await seedAdmin();
  await seedUser();

  socketHandler(io);

  server.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
  });
})
.catch(err => console.log(err));