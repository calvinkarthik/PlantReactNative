// server/telemetry-ws.js
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Telemetry WS');
});
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('client connected', req.socket.remoteAddress);
  ws.send(JSON.stringify({ type: 'welcome', ts: Date.now() }));

  ws.on('message', (message) => {
    try {
      const obj = JSON.parse(message.toString());
      // Expecting messages like: { id, x, y, s1, s2 }
      if (typeof obj.x === 'number' && typeof obj.y === 'number') {
        console.log('coords:', obj.x, obj.y, 'id:', obj.id || null);
        // Save to in-memory variables (for demo/hackathon)
        global.latestCoords = { x: obj.x, y: obj.y, ts: Date.now(), id: obj.id || null };
        // Ack back
        ws.send(JSON.stringify({ type: 'ack', id: obj.id || null, ts: Date.now() }));
      } else if (obj.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'invalid payload' }));
      }
    } catch (err) {
      console.warn('invalid json', err);
      ws.send(JSON.stringify({ type: 'error', message: 'invalid json' }));
    }
  });

  ws.on('close', () => console.log('client disconnected'));
});

server.listen(PORT, () => console.log('telemetry ws listening on', PORT));
