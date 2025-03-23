import {SystemLog} from "@repo/db/models/Systemlog";

const getLogs = async (req, res) => {
  try {
    const logs = await SystemLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching system logs:", error);
    res.status(500).json({ error: "Failed to fetch system logs" });
  }
};


export {getLogs};
