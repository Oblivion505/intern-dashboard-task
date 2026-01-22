import { useState } from "react";
import DeviceList from "./pages/DeviceList";
import DeviceDetail from "./pages/DeviceDetail";
import type { Device } from "shared";

function App() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mini Device Dashboard</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <DeviceList
              selectedDeviceId={selectedDeviceId}
              onSelectDevice={(device: Device) => setSelectedDeviceId(device.id)}
            />
          </div>
          <div className="lg:col-span-1">
            {selectedDeviceId ? (
              <DeviceDetail deviceId={selectedDeviceId} />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a device to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

