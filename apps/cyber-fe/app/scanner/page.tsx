"use client";

import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// --- Types ---
type PortInfo = {
  port?: number;
  service: string;
  severity?: number;
  risk: "low" | "medium" | "high";
};

type ScanResult = {
  ipAddress: string;
  analyzedPorts: PortInfo[];
  securityScore: number;
};

// --- Component ---
export default function Scanner() {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchIp = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/security/ip");
      if (!res.ok) throw new Error("Failed to fetch IP");
      const data = await res.json();
      setIp(data.ip);
      setError(null);
    } catch (err) {
      setError("Failed to fetch IP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const startScan = async () => {
    if (!ip) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/security/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: ip }),
      });

      if (!res.ok) throw new Error("Scan failed");

      const data: ScanResult = await res.json();
      setScanResult(data);
    } catch (err) {
      setError("Security scan failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getRiskIcon = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "medium":
        return <Shield className="w-5 h-5 text-yellow-400" />;
      case "low":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return null;
    }
  };

  const prepareChartData = (ports: PortInfo[]) => {
    return ports
      .filter((port) => typeof port.port === "number" && typeof port.severity === "number")
      .map((port) => ({
        subject: `Port ${port.port}`,
        severity: port.severity!,
        fullMark: 10,
      }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">CyberHive Security Scanner</h1>
          <p className="text-gray-400 text-lg">
            Advanced network security analysis and vulnerability detection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Scan Controls</h2>

            <div className="space-y-4">
              <button
                onClick={fetchIp}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>Fetch My IP</span>
              </button>

              {ip && (
                <div className="mt-4">
                  <p className="text-gray-400 mb-2">Target IP Address:</p>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <code className="text-green-400">{ip}</code>
                  </div>

                  <button
                    onClick={startScan}
                    disabled={loading}
                    className="w-full mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{loading ? "Scanning..." : "Start Security Scan"}</span>
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-red-400 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {scanResult && (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Scan Results</h2>

              <div className="mb-4">
                <p className="text-gray-400 mb-1">Scanned IP:</p>
                <p className="text-green-400 font-mono">{scanResult.ipAddress}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 mb-2">Security Score:</p>
                <p
                  className={`text-4xl font-bold ${getSecurityScoreColor(
                    scanResult.securityScore
                  )}`}
                >
                  {scanResult.securityScore}/100
                </p>
              </div>

              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={prepareChartData(scanResult.analyzedPorts)}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                    <PolarRadiusAxis stroke="#9CA3AF" />
                    <Radar
                      name="Port Severity"
                      dataKey="severity"
                      stroke="#60A5FA"
                      fill="#3B82F6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Port Analysis</h3>
                {scanResult.analyzedPorts.map((port, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {port.port ? `Port ${port.port}` : "Unknown Port"}
                      </p>
                      <p className="text-sm text-gray-400">{port.service}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Risk Level</p>
                        <p
                          className={`font-medium ${
                            port.risk === "high"
                              ? "text-red-400"
                              : port.risk === "medium"
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {port.risk.toUpperCase()}
                        </p>
                      </div>
                      {getRiskIcon(port.risk)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
