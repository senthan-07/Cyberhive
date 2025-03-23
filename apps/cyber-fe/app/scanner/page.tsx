"use client";

import { useState } from "react";

export default function Scanner() {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);


  const fetchIp = async () => {
    try {
      const res = await fetch("http://localhost:5000/security/ip");
      const data = await res.json();
      setIp(data.ip);
    } catch (err) {
      console.error("Failed to fetch IP", err);
    }
  };

  // Run Security Scan
  const startScan = async () => {
    if (!ip) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/security/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: ip }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      setError("Scan failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold">CyberHive Security Scanner</h1>
      <p className="mt-2 text-gray-400">Scan your IP for security risks</p>

      <button
        onClick={fetchIp}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
      >
        Fetch My IP
      </button>

      {ip && (
        <div className="mt-4 p-3 bg-gray-800 rounded-md">
          <p>Your IP: <span className="text-green-400">{ip}</span></p>
          <button
            onClick={startScan}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
          >
            {loading ? "Scanning..." : "Start Scan"}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {scanResult && (
        <div className="mt-6 p-4 bg-gray-800 rounded-md w-full max-w-lg">
          <h2 className="text-xl font-bold">Scan Results</h2>
          <p className="text-gray-400">Security Score: <span className="font-bold text-yellow-400">{scanResult.securityScore}</span></p>
          <ul className="mt-3">
            {scanResult.analyzedPorts.map((port: any) => (
              <li key={port.port} className="mt-2 p-2 border-b border-gray-700">
                <p>Port: <span className="text-green-400">{port.port}</span> - {port.service}</p>
                <p className={`text-${port.risk === "high" ? "red" : port.risk === "medium" ? "yellow" : "green"}-400`}>
                  Risk: {port.risk}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
