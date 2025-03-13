const { Client } = require("@notionhq/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

/**
 * splitTextIntoChunks - Splits a long string into chunks of at most maxLength characters.
 * @param {string} text - The text to split.
 * @param {number} maxLength - The maximum allowed length for each chunk.
 * @returns {Array} - An array of text chunks.
 */
function splitTextIntoChunks(text, maxLength = 2000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

/**
 * generateNegotiationEmailDraft - Generates a draft text based on the contract analysis.
 * @param {Array} analysis - An array of objects representing each risky clause.
 * @returns {string} - The negotiation draft text.
 */
async function generateNegotiationEmailDraft(analysis) {
  let riskyDetails = "";
  analysis.forEach((item, index) => {
    if (item && item.clause && item.risk && item.suggestion) {
      riskyDetails += `${index + 1}. Clause: ${item.clause}\n   Risk: ${item.risk}\n   Suggestion: ${item.suggestion}\n\n`;
    }
  });

  const prompt = `You are a professional contract negotiation advisor. Below are the clauses from a contract review:
${riskyDetails}
Draft a friendly, professional message outlining a proposed renegotiation meeting. Include a proposed meeting schedule and next steps to address these clauses. Provide the full text in plain language.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    });
    if (!result.response?.candidates?.length) {
      throw new Error("No response from Gemini");
    }
    const responseText = result.response.candidates[0].content.parts[0].text;
    return responseText;
  } catch (err) {
    console.error("Error generating negotiation draft:", err.message);
    throw err;
  }
}

/**
 * createNotionPage - Creates a Notion page with a renegotiation meeting schedule and a to-do list.
 * @param {Array} analysis - Array of objects representing each contract clause.
 * @param {string} [negotiationDraft] - Optional pre-generated draft text (if not provided, it will be generated).
 * @returns {Object} - The created Notion page data.
 */
async function createNotionPage(analysis = [], negotiationDraft = null) {
  try {
    // Generate negotiation draft if not provided
    let finalDraft = negotiationDraft;
    if (!finalDraft) {
      finalDraft = await generateNegotiationEmailDraft(analysis);
    }

    const meetingChunks = splitTextIntoChunks(
      finalDraft ||
        "Meeting scheduled: Please review the proposed contract revisions and schedule a follow-up meeting.",
      2000
    );

    const meetingBlocks = [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "Renegotiation Meeting Schedule",
              },
            },
          ],
        },
      },
      ...meetingChunks.map((chunk) => ({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: chunk,
              },
            },
          ],
        },
      })),
    ];

    const clauseBlocks = [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "Contract Clauses To Review",
              },
            },
          ],
        },
      },
      ...analysis.map((item) => ({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            {
              type: "text",
              text: {
                content: `Clause: ${item.clause}. Risk: ${item.risk}. Suggestion: ${item.suggestion}`,
              },
            },
          ],
        },
      })),
    ];

    const childrenBlocks = [...meetingBlocks, ...clauseBlocks];

    const pageData = {
      parent: {
        database_id: databaseId, 
      },
      properties: {
        "Task name": {
          title: [
            {
              text: {
                content: "Contract Review & Renegotiation Task",
              },
            },
          ],
        },
        "Status": {
          status: {
            name: "Not started", 
          },
        },
        "Assignee": {
          people: [
       
           
          ],
        },
        "Due date": {
          date: {
            start: "2025-03-15", 
          },
        },
        "Priority": {
          select: {
            name: "High",
          },
        },
        "Task type": {
          multi_select: [
            {
              name: "Polish", 
            },
          ],
        },
        "Effort level": {
          select: {
            name: "Medium", 
          },
        },
      },
      children: childrenBlocks,
    };

    console.log(
      "Creating Notion page with data:",
      JSON.stringify(pageData, null, 2)
    );
    const response = await notion.pages.create(pageData);
    console.log("Notion page created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating Notion page:", error);
    if (error.code === "validation_error") {
      console.error("Validation error details:", error.body);
    }
    throw error;
  }
}

module.exports = { createNotionPage, generateNegotiationEmailDraft };