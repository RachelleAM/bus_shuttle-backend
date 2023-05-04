import { WebSocketServer } from "ws";

export const connectedUsers = {};

export const createWebsocketServer = () => {
  try {
    const wss = new WebSocketServer({
      port: 8081,
      perMessageDeflate: {
        zlibDeflateOptions: {
          // See zlib defaults.
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024, // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
      },
    });

    wss.on("connection", (ws) => {
      ws.on("message", (data) => {
        const { type, content } = JSON.parse(data.toString());
        if (type === "IDENTIFICATION") {
          try {
            connectedUsers[content.toString()] = ws;
            console.log(`New user (ID: ${content}) connected to WebSocket.`);
          } catch (e) {
            console.log("New user could not connect to WebSocket.", content, e);
          }
        }
      });
    });
    console.log("Created WebSocket.");
  } catch (e) {
    console.error(e);
  }
};
