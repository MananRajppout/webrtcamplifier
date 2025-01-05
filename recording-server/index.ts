import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import { config } from 'dotenv';
import { initRecordingServer } from './config/recordingServerConfig.js';
import path from 'path';
config();


// Initialize Express app
const app = express();
app.use(express.static(path.join(process.cwd(), 'public')));
const PORT = process.env.PORT || 6756;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

initRecordingServer(wss);



// Express route
app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

// Start the Express server and WebSocket server
server.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
