import nmap from "node-nmap";
const { NmapScan } = nmap;
import { SystemLog } from "@repo/db/models/Systemlog";

const getIp = (req, res) => {
  const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  res.json({ ip: userIp });
};

const scanNetwork = async (req, res) => {
  const target = req.body.target;
  if (!target) return res.status(400).json({ error: "Target IP is required" });

  try {
    console.log(`Running Nmap scan for: ${target}`);

    const scan = new NmapScan(target, "-F");

    await SystemLog.create({
      event: "SCAN_STARTED",
      severity: "low",
      ipAddress: target,
    });

    scan.on("complete", async (data) => {
      if (!Array.isArray(data)) {
        console.error("Invalid Nmap response:", data);
        return res.status(500).json({ error: "Invalid scan response" });
      }

      const analyzedPorts = data.map((port) => ({
        port: port.port,
        service: port.service || determineService(port.port),
        risk: getRiskLevel(port.port, port.service),
      }));

      const securityScore = calculateSecurityScore(analyzedPorts);

      try {
        await SystemLog.create({
          event: "SCAN_COMPLETED",
          severity: securityScore < 80 ? "medium" : "low",
          ipAddress: target,
          scannedPorts: analyzedPorts,
          securityScore,
          anomalyDetected: securityScore < 50,
        });

        res.json({ ipAddress: target, analyzedPorts, securityScore });
      } catch (dbError) {
        console.error("Error saving scan result:", dbError);
        res.status(500).json({ error: "Failed to save scan results" });
      }
    });

    scan.on("error", (error) => {
      console.error("Scan error:", error);
      res.status(500).json({ error: "Scan failed", details: error.message });
    });

    scan.startScan();
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Unexpected error", details: error.message });
  }
};

function determineService(port) {
  const serviceMapping = {
    22: "SSH",
    80: "HTTP",
    443: "HTTPS",
    21: "FTP",
    23: "Telnet",
    3389: "RDP",
    445: "SMB",
  };

  return serviceMapping[port] || "Unknown";
}

function getRiskLevel(port, service) {
  const highRiskPorts = [22, 3389, 445];
  const mediumRiskPorts = [80, 443, 21, 23];

  if (highRiskPorts.includes(port)) return "high"; 
  if (mediumRiskPorts.includes(port)) return "medium";

  if (service === "SSH" || service === "RDP") return "high";
  if (service === "HTTP" || service === "FTP") return "medium";

  return "low";
}

function calculateSecurityScore(ports) {
  let score = 100;
  ports.forEach((p) => {
    if (p.risk === "high") score -= 10;
    else if (p.risk === "medium") score -= 5;
  });
  return Math.max(score, 0);
}

export { scanNetwork, getIp };
