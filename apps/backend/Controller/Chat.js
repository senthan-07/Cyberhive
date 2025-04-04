import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ChatHandler = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const params = {
      model: "deepseek-r1-distill-llama-70b",
      messages,
      stream: true, // Enable streaming
    };

    const response = await groq.chat.completions.create(params);

    res.setHeader("Content-Type", "text/plain");

    for await (const chunk of response) {
      const text = chunk.choices?.[0]?.delta?.content || "";
      res.write(text);
    }

    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { ChatHandler };
