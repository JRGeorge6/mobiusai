import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { WebSocket, WebSocketServer } from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = WebSocket;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

// Simple WebSocket server for potential real-time features
export let wss: WebSocketServer | undefined;

export const setupWebSocketServer = (server: any) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    // ... existing code ...
  });
};