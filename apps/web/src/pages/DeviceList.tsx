import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import type { Device } from "shared";

interface DeviceListProps {
  selectedDeviceId: number | null;
  onSelectDevice: (device: Device) => void;
}

function DeviceList({ selectedDeviceId, onSelectDevice }: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/devices`);
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }
      const data = await response.json();
      setDevices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Devices</h2>
        <div className="text-center py-8">Loading devices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Devices</h2>
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchDevices}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Devices</h2>
      <div className="space-y-2">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => onSelectDevice(device)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              selectedDeviceId === device.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{device.name}</h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  device.status
                )}`}
              >
                {device.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">Site: {device.site}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {device.id}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DeviceList;

