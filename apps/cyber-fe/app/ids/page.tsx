"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  AlertCircle,
  Activity,
  Network,
  Scan,
  ArrowRight,
} from "lucide-react";

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
  const [ip, setIp] = useState<string>("");
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [activeTab, setActiveTab] = useState<"alerts" | "scans">("alerts");
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
    const cameFromDashboard = sessionStorage.getItem("fromDashboard");
  
    if (cameFromDashboard) {
      sessionStorage.removeItem("fromDashboard");
      setAuthorized(true);
    }
  
    setAuthChecked(true);
  }, []);
  

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/system/logs/${ip}`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data.logs);

        const highTraffic = data.logs.filter(
          (log: LogEntry) => log.event === "HIGH_TRAFFIC_ALERT"
        );

        const count = highTraffic.length * 10 + 10;
        const newEntry = {
          time: new Date().toLocaleTimeString(),
          count,
        };

        setTrafficData((prev) => {
          const updated = [...prev, newEntry];
          return updated.length > 20 ? updated.slice(-20) : updated;
        });
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, ip]);
  
  useEffect(() => {
    if (authChecked && !authorized) {
      router.replace("/Dashboard");
    }
  }, [authChecked, authorized, router]);
  
  console.log("authChecked:", authChecked, "authorized:", authorized);
  
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Checking authorization...</p>
      </div>
    );
  }
  
  if (authChecked && !authorized) {
    return null;
  }
  

  const startMonitoring = async () => {
    if (!ip) return;
    try {
      const res = await fetch("http://localhost:5000/IDS/monitor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsMonitoring(true);
      } else {
        console.error(data.error || "Failed to monitor");
      }
    } catch (error) {
      console.error("Failed to start monitoring:", error);
    }
  };

  const maxPackets = Math.max(...trafficData.map((d) => d.count), 100);
  const calculateHeight = (count: number) => {
    return Math.min((count / maxPackets) * 100, 100);
  };

  const portScanLogs = logs.filter((log) => log.event === "PORT_SCAN_DETECTED");
  const alertLogs = logs.filter((log) => log.event !== "PORT_SCAN_DETECTED");

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
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Enter IP address"
                className="w-full sm:w-64 rounded-lg border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-4 py-2.5 transition-all duration-200"
              />
              <button
                onClick={startMonitoring}
                disabled={isMonitoring || !ip}
                className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 shadow-sm ${
                  isMonitoring ? "bg-green-500 hover:bg-green-600" : "bg-indigo-600 hover:bg-indigo-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isMonitoring ? "Monitoring..." : "Start Monitoring"}
              </button>
              <button
                onClick={() => {
                  router.push("/Dashboard");
                }}
                className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-sm"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatusCard title="Active Monitoring" value={isMonitoring ? "Active" : "Inactive"} Icon={Activity} color="green" />
          <StatusCard title="Security Alerts" value={alertLogs.length.toString()} Icon={AlertCircle} color="red" />
          <StatusCard title="Port Scans" value={portScanLogs.length.toString()} Icon={Scan} color="purple" />
          <StatusCard title="Monitored IP" value={ip || "None"} Icon={Network} color="blue" />
        </div>

        <TrafficGraph data={trafficData} maxPackets={maxPackets} calculateHeight={calculateHeight} />

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 flex">
            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-6 py-4 text-sm font-medium relative ${
                activeTab === "alerts" ? "text-indigo-600 bg-white/50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Security Alerts
              {activeTab === "alerts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
            <button
              onClick={() => setActiveTab("scans")}
              className={`px-6 py-4 text-sm font-medium relative ${
                activeTab === "scans" ? "text-purple-600 bg-white/50" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Port Scans
              {activeTab === "scans" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />}
            </button>
          </div>

          <div className="divide-y divide-gray-100 max-h-[32rem] overflow-auto">
            {(activeTab === "alerts" ? alertLogs : portScanLogs).map((log, index) =>
              activeTab === "alerts" ? <AlertLogEntry key={index} log={log} /> : <PortScanEntry key={index} log={log} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({ title, value, Icon, color }: { title: string; value: string; Icon: any; color: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-500`} />
        </div>
      </div>
    </div>
  );
}

function TrafficGraph({
  data,
  maxPackets,
  calculateHeight,
}: {
  data: TrafficData[];
  maxPackets: number;
  calculateHeight: (count: number) => number;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Traffic Overview</h2>
        <div className="text-sm text-gray-500">Auto Max: {maxPackets} packets</div>
      </div>
      <div className="h-64 flex items-end space-x-1">
        {data.map((entry, index) => (
          <div
            key={index}
            className="flex-1 bg-gradient-to-t from-indigo-100 to-indigo-50 hover:from-indigo-200 hover:to-indigo-100 transition-all duration-200 rounded-t-sm relative group"
            style={{ height: `${calculateHeight(entry.count)}%` }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              {entry.time}: {entry.count} packets
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        {data.length > 0 && (
          <>
            <span>{data[0].time}</span>
            <span>{data[data.length - 1].time}</span>
          </>
        )}
      </div>
    </div>
  );
}

function AlertLogEntry({ log }: { log: LogEntry }) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{log.event}</p>
          <p className="text-sm text-gray-500">{log.ipAddress}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              log.severity === "high"
                ? "bg-red-100 text-red-700"
                : log.severity === "medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {log.severity}
          </span>
          <span className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

function PortScanEntry({ log }: { log: LogEntry }) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Scan className="h-4 w-4 text-purple-600" />
            <p className="text-sm font-medium text-purple-600">Port Scan Detected</p>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Source:</span>
            <span className="font-medium">{log.ipAddress}</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-500">Ports:</span>
            <span className="font-medium text-purple-600">
              {log.scannedPorts?.length ? log.scannedPorts.join(", ") : "Unknown"}
            </span>
          </div>
        </div>
        <div className="ml-4 flex flex-col items-end">
          <span className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            {log.severity}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
