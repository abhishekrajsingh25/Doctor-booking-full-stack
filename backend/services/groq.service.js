export const askGroq = async (prompt) => {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        }),
      }
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      console.error("GROQ API ERROR 👉", data);
      throw new Error(data.error?.message || "Groq API failed");
    }
  
    if (!data.choices || !data.choices.length) {
      console.error("INVALID GROQ RESPONSE 👉", data);
      throw new Error("Invalid response from Groq");
    }
  
    return data.choices[0].message.content;
  };
  