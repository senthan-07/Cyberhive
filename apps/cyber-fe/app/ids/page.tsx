"use client"
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Network } from 'lucide-react';

interface LogEntry {
  event: string;
  severity: string;
  ipAddress: string;
  timestamp: string;
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

  // Simulate real-time data updates
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate new traffic data point
      setTrafficData(prev => {
        const newData = [...prev];
        if (newData.length > 20) newData.shift();
        return [...newData, {
          time: new Date().toLocaleTimeString(),
          count: Math.floor(Math.random() * 50) + 10
        }];
      });

      // Simulate log entries
      if (Math.random() > 0.8) {
        setLogs(prev => [{
          event: Math.random() > 0.5 ? 'PORT_SCAN_DETECTED' : 'HIGH_TRAFFIC_ALERT',
          severity: Math.random() > 0.5 ? 'high' : 'medium',
          ipAddress: ip,
          timestamp: new Date().toISOString()
        }, ...prev].slice(0, 100));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring, ip]);

  const startMonitoring = async () => {
    if (!ip) return;
  
    try {
      const res = await fetch('http://localhost:5000/IDS/monitor/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">IDS Monitor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Enter IP address"
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
            />
            <button
              onClick={startMonitoring}
              disabled={isMonitoring || !ip}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isMonitoring
                  ? 'bg-green-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Monitoring</p>
                <p className="text-2xl font-semibold text-gray-900">{isMonitoring ? 'Active' : 'Inactive'}</p>
              </div>
              <Activity className={`h-8 w-8 ${isMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monitored IP</p>
                <p className="text-2xl font-semibold text-gray-900">{ip || 'None'}</p>
              </div>
              <Network className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Traffic Graph */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h2>
          <div className="h-64 flex items-end space-x-2">
            {trafficData.map((data, index) => (
              <div
                key={index}
                className="flex-1 bg-indigo-100 hover:bg-indigo-200 transition-all duration-200"
                style={{ height: `${(data.count / 60) * 100}%` }}
                title={`${data.time}: ${data.count} packets`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-500">
            {trafficData.length > 0 && (
              <>
                <span>{trafficData[0].time}</span>
                <span>{trafficData[trafficData.length - 1].time}</span>
              </>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Security Logs</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.event}</p>
                    <p className="text-sm text-gray-500">{log.ipAddress}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.severity === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.severity}
                    </span>
                    <span className="ml-4 text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
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