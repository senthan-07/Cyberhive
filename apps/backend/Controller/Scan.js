import nmap from "node-nmap";
const { NmapScan } = nmap;


export const scanNetwork = async (req, res) => {
  const { target } = req.body;
  if (!target) {
    return res.status(400).json({ error: "Target is required" });
  }

  try {
    // Create an Nmap scan
    const scan = new NmapScan(target, "-F");

    scan.on("complete", (data) => {
      res.json({ success: true, data });
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

