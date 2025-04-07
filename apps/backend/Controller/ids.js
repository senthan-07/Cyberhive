import pcap from "pcap";
import { SystemLog } from "@repo/db/models/Systemlog";

const monitorTraffic = (ip) => {
  if (!ip) {
    console.error("No IP provided for monitoring!");
    return;
  }

  console.log(`Monitoring traffic for ${ip}...`);

  let iface = "eth0";
  try {
    const devices = pcap.findalldevs();
    if (devices.length > 0) {
      iface = devices[0].name;
    }
  } catch (e) {
    console.warn("Interface detection failed, using eth0.");
  }

  const session = pcap.createSession(iface, `host ${ip}`);

  const scanAttempts = new Map(); // srcIP -> Set of dstPorts
  let trafficCount = 0;
  let lastResetTime = Date.now();

  session.on("packet", async (rawPacket) => {
    try {
      const packet = pcap.decode.packet(rawPacket);
      const ipLayer = packet.payload?.payload;

      const srcIp = ipLayer?.saddr?.addr?.join(".");
      const dstIp = ipLayer?.daddr?.addr?.join(".");

      if (!srcIp || !dstIp || srcIp === dstIp) return;

      let dstPort = null;
      const protocol = ipLayer?.protocol;

      if (protocol === 6) { // TCP
        dstPort = packet.payload.payload.payload?.dport;
      } else if (protocol === 17) { // UDP
        dstPort = packet.payload.payload.payload?.dport;
      }

      // Port scan detection (only if port info is available)
      if (dstPort) {
        const key = `${srcIp}->${dstIp}`;
        if (!scanAttempts.has(key)) {
          scanAttempts.set(key, new Set());
        }

        const portSet = scanAttempts.get(key);
        portSet.add(dstPort);

        if (portSet.size > 10) {
          console.warn(`Port scan detected from ${srcIp} to ${dstIp}`);
          await SystemLog.create({
            event: "PORT_SCAN_DETECTED",
            severity: "high",
            ipAddress: srcIp,
          });
          scanAttempts.delete(key);
        }
      }

      // High traffic detection
      trafficCount++;
      const now = Date.now();
      if (now - lastResetTime > 10000) { // every 10 seconds
        if (trafficCount > 50) {
          console.warn(`High traffic detected on ${ip}`);
          await SystemLog.create({
            event: "HIGH_TRAFFIC_ALERT",
            severity: "medium",
            ipAddress: ip,
          });
        }
        trafficCount = 0;
        lastResetTime = now;
      }

    } catch (err) {
      console.error("Packet Processing Error:", err);
    }
  });

  return session;
};

const IDSHandler = async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP address is required!" });

  try {
    monitorTraffic(ip);
    res.json({ message: `Started monitoring ${ip}` });
  } catch (err) {
    console.error("Error starting monitor:", err);
    res.status(500).json({ error: "Failed to start monitoring." });
  }
};

export { IDSHandler };
