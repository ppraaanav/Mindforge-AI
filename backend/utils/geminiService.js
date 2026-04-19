const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateFromGemini = async (prompt) => {
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.1-8b-instant",
  });

  return chatCompletion.choices[0]?.message?.content || "No response";
};

module.exports = {
  generateFromGemini,
};