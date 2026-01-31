import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import type { Device, Reading, ErrorResponse } from "shared";

interface DeviceDetailProps {
  deviceId: number;
}

function DeviceDetail({ deviceId }: DeviceDetailProps) {

  const [device, setDevice] = useState<Device | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [powerUsageKw, setPowerUsageKw] = useState("");
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    fetchDevice();
    fetchReadings();
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/devices`);
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }
      const devices: Device[] = await response.json();
      const foundDevice = devices.find((d) => d.id === deviceId);
      if (!foundDevice) {
        setError("Device not found");
      } else {
        setDevice(foundDevice);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/readings?limit=20`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Device not found");
          return;
        }
        throw new Error("Failed to fetch readings");
      }
      const data = await response.json();
      setReadings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const body: { powerUsageKw: number; timestamp?: string } = {
        powerUsageKw: parseFloat(powerUsageKw),
      };

      if (timestamp) {
        body.timestamp = timestamp;
      }

      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/readings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error.message);
      }

      // Reset form
      setPowerUsageKw("");
      setTimestamp("");
      // Show success message
      setFormSuccess("Reading created successfully!");
      // Refresh readings
      await fetchReadings();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create reading");
    } finally {
      setSubmitting(false);
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

  if (loading && !device) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">Loading device...</div>
      </div>
    );
  }

  if (error && !device) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{device.name}</h2>
            <p className="text-gray-600">Site: {device.site}</p>
            <p className="text-sm text-gray-500">ID: {device.id}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
              device.status
            )}`}
          >
            {device.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Create Reading</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="powerUsageKw" className="block text-sm font-medium text-gray-700 mb-1">
              Power Usage (kW) *
            </label>
            <input
              type="number"
              id="powerUsageKw"
              step="0.01"
              min="0"
              required
              value={powerUsageKw}
              onChange={(e) => setPowerUsageKw(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
              Timestamp (optional)
            </label>
            <input
              type="text"
              id="timestamp"
              placeholder="ISO format (e.g., 2024-01-15T10:30:00.000Z)"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {formError && <p className="text-red-600 text-sm">{formError}</p>}
          {formSuccess && <p className="text-green-600 text-sm">{formSuccess}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Reading"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Readings</h3>
        {loading ? (
          <div className="text-center py-4">Loading readings...</div>
        ) : readings.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No readings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Power Usage (kW)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readings.map((reading) => (
                  <tr key={reading.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(reading.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.powerUsageKw.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeviceDetail;

