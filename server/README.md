Plant server helpers

This folder contains small demo servers for hackathon use:

- `telemetry-ws.js`: A tiny WebSocket server that accepts JSON messages with x/y coordinates and replies with an ack.
- `camera-server.js` (optional): simple snapshot HTTP server using `raspistill` (not included here by default).

Quick start:

1. On the Pi, install Node and dependencies:

   sudo apt update
   sudo apt install -y nodejs npm

2. Install server deps:

   cd ~/path/to/PlantReactNative/server
   npm ci

3. Run the telemetry server:

   npm run telemetry

The telemetry server listens on port 3000 by default. From the phone (connected to the Pi via hotspot) you can open a WebSocket to `ws://<pi_ip>:3000` and send JSON like:

  { "id": "m1", "x": 12.34, "y": 56.78 }

The server logs received coords and responds with an ack.
