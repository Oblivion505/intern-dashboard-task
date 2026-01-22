import express from "express";
import cors from "cors";
import { z } from "zod";
import type { Device, Reading, CreateReadingRequest, ErrorResponse } from "shared";

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// In-memory storage
let devices: Device[] = [];
let readings: Reading[] = [];

// Seed data
function seedData() {
  const now = new Date();
  const sites = ["Building A", "Building B", "Building C", "Warehouse", "Office"];

  devices = [
    { id: 1, name: "Device Alpha", status: "online", site: sites[0] },
    { id: 2, name: "Device Beta", status: "online", site: sites[1] },
    { id: 3, name: "Device Gamma", status: "warning", site: sites[2] },
    { id: 4, name: "Device Delta", status: "offline", site: sites[3] },
    { id: 5, name: "Device Epsilon", status: "online", site: sites[4] },
  ];

  readings = [];
  let readingIdCounter = 1;
  devices.forEach((device) => {
    for (let i = 0; i < 5; i++) {
      const hoursAgo = Math.random() * 6; // 0-6 hours ago
      const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      readings.push({
        id: `reading-${readingIdCounter++}`,
        deviceId: device.id,
        timestamp: timestamp.toISOString(),
        powerUsageKw: Math.random() * 50 + 10,
      });
    }
  });

  // Sort readings by timestamp (newest first)
  readings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Helper to compute device status based on latest reading
function computeDeviceStatus(deviceId: number): "online" | "offline" | "warning" {
  const deviceReadings = readings
    .filter((r) => r.deviceId === deviceId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (deviceReadings.length === 0) {
    return "offline";
  }

  const latestReading = deviceReadings[0];
  const latestTime = new Date(latestReading.timestamp).getTime();
  const now = Date.now();
  const minutesSinceReading = (now - latestTime) / (1000 * 60);

  if (minutesSinceReading > 120) {
    return "offline";
  } else if (minutesSinceReading > 30) {
    return "warning";
  }
  return "online";
}

// Validation schemas
const createReadingSchema = z.object({
  timestamp: z.string().datetime().optional(),
  powerUsageKw: z.number().min(0),
});

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /devices
app.get("/devices", (req, res) => {
  // Update device statuses based on latest readings
  const updatedDevices = devices.map((device) => ({
    ...device,
    status: computeDeviceStatus(device.id),
  }));
  res.json(updatedDevices);
});

// GET /devices/:id/readings
app.get("/devices/:id/readings", (req, res) => {
  const deviceId = parseInt(req.params.id, 10);
  const limit = parseInt(req.query.limit as string, 10) || 20;

  // Check if device exists
  const device = devices.find((d) => d.id === deviceId);
  if (!device) {
    const error: ErrorResponse = {
      error: {
        message: "Device not found",
        details: { deviceId },
      },
    };
    return res.status(404).json(error);
  }

  // Get readings for device, sorted newest first
  const deviceReadings = readings
    .filter((r) => r.deviceId === deviceId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  res.json(deviceReadings);
});

// POST /devices/:id/readings
// TODO: Candidate task - implement this endpoint
app.post("/devices/:id/readings", (req, res) => {
  const error: ErrorResponse = {
    error: {
      message: "Not implemented - candidate task",
    },
  };
  res.status(501).json(error);
});

// Start server
seedData();
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

