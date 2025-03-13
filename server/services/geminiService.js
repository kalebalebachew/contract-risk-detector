const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * analyzeContract - Analyzes a contract or document using the Gemini API
 * @param {string} text - The full text to analyze (contract or otherwise).
 * @param {string} [model="gemini-1.5-flash"] - The Gemini model to use (default: gemini-1.5-flash).
 * @returns {Object} - A JSON object with analysis details or error information.
 */
async function analyzeContract(text, model = "gemini-1.5-flash") {
  if (!text || typeof text !== "string" || text.trim() === "") {
    return {
      status: "error",
      message: "Invalid input: Text must be a non-empty string",
      analysis: null,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return {
      status: "error",
      message:
        "API key not configured. Please set GEMINI_API_KEY in your environment",
      analysis: null,
    };
  }

  const prompt = `You are a legal expert who reviews contracts and documents for freelancers and startups. 
  Analyze the following text and determine if it’s a contract. 
  If it is a contract, identify any potentially risky clauses; for each, provide a brief plain English explanation of the risk and suggest improvements. 
  If it’s not a contract, explain why and summarize the document’s purpose or content instead. 
  Provide your output in JSON format as an array of objects. For contracts, 
  use keys "clause", "risk", and "suggestion". For non-contracts, use keys "isContract" (set to false), "reason", and "summary". 
  If the text is too vague or invalid, return an error message in the array.

Text to Analyze:
${text.trim()}
Response:`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelInstance = genAI.getGenerativeModel({ model }); // Use the provided model

    const result = await Promise.race([
      modelInstance.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("API request timed out")), 15000)
      ),
    ]);

    if (!result.response?.candidates?.length) {
      return {
        status: "error",
        message: "API returned no valid response candidates",
        analysis: null,
      };
    }

    const responseText = result.response.candidates[0].content.parts[0].text;

    let analysis;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*?\](?=(```)?|$)/);
      if (!jsonMatch) {
        throw new Error("No valid JSON array found in response");
      }
      const cleanedJson = jsonMatch[0].replace(/```json|```/g, "").trim();
      console.log("Extracted JSON:", cleanedJson);
      analysis = JSON.parse(cleanedJson);

      if (!Array.isArray(analysis) || analysis.length === 0) {
        analysis = [
          {
            isContract: false,
            reason: "Analysis returned empty",
            summary: responseText,
          },
        ];
      }
    } catch (parseError) {
      console.warn(
        "JSON Parse Error:",
        parseError.message,
        "Raw Text:",
        responseText
      );
      const partialMatch = responseText.match(/\{[\s\S]*?(?=,\s*\{|\]$|$)/g);
      if (partialMatch) {
        analysis = partialMatch.map((chunk) => {
          try {
            const fixedChunk = chunk.match(/\}$/) ? chunk : chunk + "}";
            const parsed = JSON.parse(fixedChunk);
            return parsed.clause
              ? parsed
              : {
                  isContract: false,
                  reason: "Partial response parsed",
                  summary: chunk,
                };
          } catch {
            return {
              isContract: false,
              reason: "Unable to parse API response as JSON",
              summary:
                responseText.slice(0, 400) +
                (responseText.length > 400 ? "..." : ""),
            };
          }
        });
      } else {
        analysis = [
          {
            isContract: false,
            reason: "Unable to parse API response as JSON",
            summary:
              responseText.slice(0, 400) +
              (responseText.length > 400 ? "..." : ""),
          },
        ];
      }
    }

    return {
      status: "success",
      message: "Analysis completed",
      analysis,
    };
  } catch (err) {
    console.error("Error calling Gemini API:", err.message);
    let errorMessage = "Unknown error occurred";
    if (err.message.includes("API_KEY_INVALID"))
      errorMessage = "Invalid API key";
    else if (err.message.includes("timed out"))
      errorMessage = "API request timed out";
    else if (err.message.includes("Quota")) errorMessage = "API quota exceeded";

    return {
      status: "error",
      message: errorMessage,
      analysis: null,
    };
  }
}

module.exports = { analyzeContract };