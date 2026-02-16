import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { setupSocket } from './socket/socketServer.js';

const start = async () => {
  await connectDB();
  const server = http.createServer(app);
  await setupSocket(server);

  server.listen(env.port, () => {
    console.log(`Server running on ${env.port}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
