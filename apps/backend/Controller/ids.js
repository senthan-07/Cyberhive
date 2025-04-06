import pcap from "pcap";
import { SystemLog } from "@repo/db/models/Systemlog";

const monitorTraffic = (ip) => {
  if (!ip) {
    console.error("No IP provided for monitoring!");
    return;
  }

  console.log(`Monitoring traffic for ${ip}...`);

  const session = pcap.createSession("eth0", `host ${ip}`); // Replace eth0 with your network interface

  let trafficCount = 0;
  let scanAttempts = new Map();

  session.on("packet", async (rawPacket) => {
    try {
      const packet = pcap.decode.packet(rawPacket);

      const srcIp = packet.payload.payload.saddr?.addr.join(".");
      const dstIp = packet.payload.payload.daddr?.addr.join(".");

      if (!srcIp || !dstIp) return;
      if (srcIp === dstIp) return; // Ignore self-traffic

      // 1. Detect Port Scanning**
      if (!scanAttempts.has(srcIp)) {
        scanAttempts.set(srcIp, new Set());
      }
      scanAttempts.get(srcIp).add(dstIp);

      if (scanAttempts.get(srcIp).size > 10) {
        console.warn(`Port scan detected from ${srcIp}`);
        await SystemLog.create({
          event: "PORT_SCAN_DETECTED",
          severity: "high",
          ipAddress: srcIp,
        });
        scanAttempts.delete(srcIp); // Reset
      }

      // . Detect High Traffic to IP**
      trafficCount++;
      if (trafficCount > 100) {
        console.warn(`🚨 Unusual traffic detected on ${ip}`);
        await SystemLog.create({
          event: "HIGH_TRAFFIC_ALERT",
          severity: "medium",
          ipAddress: ip,
        });
        trafficCount = 0; // Reset count
      }

    } catch (err) {
      console.error("Packet Processing Error:", err);
    }
  });

  return session;
};



const IDSHandler = async(req,res)=>{
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: "IP address is required!" });
    try{
      const session = monitorTraffic(ip);
      res.json({ message: `Started monitoring ${ip}` });
    }catch(err){
      res.json(err);
    }
}

export {IDSHandler}