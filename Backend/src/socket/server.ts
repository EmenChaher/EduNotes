import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { corsUrl, webSocketPort } from '@config/envVar';
import Logger from '@core/Logger';

const app = express();
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200, credentials: true }));

const server = http.createServer(app);
const socketServer = new Server(server, {
  cors: {
    origin: corsUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

server.listen(webSocketPort, () => {
  Logger.info(`Socket.IO server running on port: ${webSocketPort} ✅`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    Logger.error(`Socket.IO server port ${webSocketPort} is already in use. Shutting down process`);
    process.exit(1);
  } else {
    Logger.error(`Socket.IO server error: ${error.message}`);
  }
});

export { app, socketServer };
