import nmap from "node-nmap";
const { NmapScan } = nmap;


export const scanNetwork = (req, res) => {
  const { target } = req.body;
  if (!target) {
    return res.status(400).json({ error: "Target is required" });
  }

  // Create an Nmap scan
  const scan = new NmapScan(target, "-F"); // "-F" for a fast scan

  scan.on("complete", (data) => {
    res.json({ success: true, data });
  });

  scan.on("error", (error) => {
    console.error(error);
    res.status(500).json({ error: "Scan failed", details: error.message });
  });

  scan.startScan();
};
