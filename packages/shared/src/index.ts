export type DeviceStatus = "online" | "offline" | "warning";

export interface Device {
  id: number;
  name: string;
  status: DeviceStatus;
  site: string;
}

export interface Reading {
  id: string;
  deviceId: number;
  timestamp: string; // ISO string
  powerUsageKw: number;
}

export interface CreateReadingRequest {
  timestamp?: string;
  powerUsageKw: number;
}

export interface ErrorResponse {
  error: {
    message: string;
    details?: any;
  };
}

