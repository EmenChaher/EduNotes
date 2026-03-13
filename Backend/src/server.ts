import Logger from './core/Logger';
import { expressPort } from './config/envVar';
import app from './app';

const server = app
  .listen(expressPort, () => {
    Logger.info(`Express server running on port : ${expressPort} ✅`);
  })
  .on('error', (e) => {
    Logger.error(e);
  });

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    Logger.error(`Port ${expressPort} is already in use. Shutting down server...`);
    process.exit(1);
  } else {
    Logger.error(`Server error: ${error.message}`);
  }
});
