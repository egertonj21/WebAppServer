import express from "express";
import { WebSocketServer } from "ws";
import { createConnection } from "./dbconfig.js";
import cors from "cors";

import ledstripRoutes from "./routes/ledstripRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import otherRoutes from "./routes/otherRoutes.js";

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080 });

const init = async () => {
    let connection;
    try {
        // MySQL connection setup
        connection = await createConnection();

        // Initialize routes
        app.use('/ledstrip', ledstripRoutes(connection));
        app.use('/sensors', sensorRoutes(connection));
        app.use('/others', otherRoutes(connection));

        // Handle WebSocket connections (move to a separate module if needed)
        wss.on('connection', async (ws) => {
            console.log('New client connected');
            // WebSocket logic here...
        });

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } catch (error) {
        console.error("Failed to initialize:", error);
    }
};

init();

const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

export { broadcast };
