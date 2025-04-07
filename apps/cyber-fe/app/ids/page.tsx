"use client"
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Network } from 'lucide-react';

interface LogEntry {
  event: string;
  severity: string;
  ipAddress: string;
  createdAt: string;
  scannedPorts?: number[];
  anomalyDetected?: boolean;
}

interface TrafficData {
  time: string;
  count: number;
}

function App() {
  const [ip, setIp] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  
  // Maximum number of packets to show in the graph
  const MAX_PACKETS = 500;

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/system/logs/${ip}`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data.logs);

        const highTraffic = data.logs.filter((log: LogEntry) => log.event === "HIGH_TRAFFIC_ALERT");
        setTrafficData(prev => {
          const newData = [...prev];
          if (newData.length > 20) newData.shift();
          return [
            ...newData,
            {
              time: new Date().toLocaleTimeString(),
              count: highTraffic.length * 10 + 10
            }
          ];
        });
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, ip]);

  const startMonitoring = async () => {
    if (!ip) return;

    try {
      const res = await fetch('http://localhost:5000/IDS/monitor/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(data.message);
        setIsMonitoring(true);
      } else {
        console.error(data.error || 'Failed to monitor');
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  // Calculate the height percentage based on packet count and MAX_PACKETS
  const calculateHeight = (count: number) => {
    return Math.min((count / MAX_PACKETS) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                IDS Monitor
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="Enter IP address"
                  className="w-full sm:w-64 rounded-lg border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-4 py-2.5 transition-all duration-200"
                />
              </div>
              <button
                onClick={startMonitoring}
                disabled={isMonitoring || !ip}
                className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 shadow-sm ${
                  isMonitoring
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Monitoring</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{isMonitoring ? 'Active' : 'Inactive'}</p>
              </div>
              <div className={`p-3 rounded-lg ${isMonitoring ? 'bg-green-50' : 'bg-gray-50'}`}>
                <Activity className={`h-6 w-6 ${isMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{logs.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monitored IP</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{ip || 'None'}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Network className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Traffic Overview</h2>
            <div className="text-sm text-gray-500">Max: {MAX_PACKETS} packets</div>
          </div>
          <div className="h-64 flex items-end space-x-1">
            {trafficData.map((data, index) => (
              <div
                key={index}
                className="flex-1 bg-indigo-100 hover:bg-indigo-200 transition-all duration-200 rounded-t-sm relative group"
                style={{ height: `${calculateHeight(data.count)}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {data.time}: {data.count} packets
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            {trafficData.length > 0 && (
              <>
                <span>{trafficData[0].time}</span>
                <span>{trafficData[trafficData.length - 1].time}</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-white/50">
            <h2 className="text-lg font-semibold text-gray-900">Security Logs</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[32rem] overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.event}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{log.ipAddress}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        log.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : log.severity === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {log.severity}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;