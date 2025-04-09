"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

// --- Types ---
type Vulnerability = {
  VulnerabilityID: string;
  PkgName: string;
  InstalledVersion: string;
  FixedVersion: string;
  Severity: string;
  Title?: string;
  Description?: string;
};

type ScanResult = {
  ArtifactName: string;
  Results: {
    Target: string;
    Vulnerabilities: Vulnerability[];
  }[];
};

// --- Component ---
export default function Scanner() {
  const [imageName, setImageName] = useState<string>("");
  const [tag, setTag] = useState<string>("latest");
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popupData, setPopupData] = useState<{ id: string; description: string } | null>(null);
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

  const startScan = async () => {
    if (!imageName) {
      setError("Please provide an image name.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/trivy/vuln", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageName, tag }),
      });

      if (!res.ok) throw new Error("Scan failed");

      const data = await res.json();
      setScanResult(data.results); // Ensure the correct property is being accessed
    } catch (err) {
      setError("Security scan failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const truncateDescription = (description: string) => {
    if (!description) return "-";
    return description.length > 50 ? `${description.slice(0, 50)}...` : description;
  };

  const renderVulnerabilityTable = () => {
    if (!scanResult || !scanResult.Results) {
      return (
        <div className="mt-4 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
          <p className="text-gray-400">No scan results available.</p>
        </div>
      );
    }

    // Flatten all vulnerabilities from the Results array
    const vulnerabilities = scanResult.Results.flatMap(
      (result) => result.Vulnerabilities || []
    );

    if (vulnerabilities.length === 0) {
      return (
        <div className="mt-4 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
          <p className="text-gray-400">No vulnerabilities found.</p>
        </div>
      );
    }

    return (
      <table className="w-full mt-4 bg-gray-800 text-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700">
            <th className="py-3 px-4 text-left w-[200px]">Vulnerability ID</th>
            <th className="py-3 px-4 text-left">Package Name</th>
            <th className="py-3 px-4 text-left">Installed Version</th>
            <th className="py-3 px-4 text-left">Fixed Version</th>
            <th className="py-3 px-4 text-left">Severity</th>
            <th className="py-3 px-4 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {vulnerabilities.map((vuln, index) => (
            <tr key={index} className="border-b border-gray-600">
              <td className="py-3 px-4 w-[200px] break-words">{vuln.VulnerabilityID}</td>
              <td className="py-3 px-4">{vuln.PkgName}</td>
              <td className="py-3 px-4">{vuln.InstalledVersion}</td>
              <td className="py-3 px-4">{vuln.FixedVersion || "-"}</td>
              <td className={`py-3 px-4 ${getSeverityColor(vuln.Severity)}`}>
                {vuln.Severity}
              </td>
              <td
                className="py-3 px-4 cursor-pointer hover:text-blue-400"
                onClick={() =>
                  setPopupData({
                    id: vuln.VulnerabilityID,
                    description: vuln.Description || "-",
                  })
                }
              >
                {truncateDescription(vuln.Description || "-")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Container Image Vulnerability Scanner</h1>
          <p className="text-gray-400 text-lg">
            Scan container images for vulnerabilities using Trivy
          </p>
        </div>

        {/* Centered Scan Controls */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Scan Controls
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Image Name</label>
                <input
                  type="text"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  placeholder="e.g., python"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Tag</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g., 3.4-alpine"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={startScan}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{loading ? "Scanning..." : "Start Scan"}</span>
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vulnerability Table */}
        {scanResult && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Scan Results</h2>

            <div className="mb-4">
              <p className="text-gray-400 mb-1">Scanned Image:</p>
              <p className="text-green-400 font-mono">{scanResult.ArtifactName}</p>
            </div>

            {renderVulnerabilityTable()}
          </div>
        )}

        {/* Pop-up for Full Description */}
        {popupData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setPopupData(null)}
          >
            <div
              className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full text-white relative"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
                onClick={() => setPopupData(null)}
              >
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-4">
                CVE Details: {popupData.id}
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap">
                {popupData.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}