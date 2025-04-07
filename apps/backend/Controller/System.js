import {SystemLog} from "@repo/db/models/Systemlog";

const getLogs = async (req, res) => {
  const { ip } = req.params;
  try {
    const logs = await SystemLog.find({ ipAddress: ip })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ logs });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};



export {getLogs};
