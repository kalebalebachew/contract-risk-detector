const fs = require("fs");
const pdf = require("pdf-parse");
const { analyzeContract } = require("../services/geminiService");
const { createNotionPage } = require("../services/notionService");

exports.uploadContract = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const setupNotion = req.body.setupNotion; 

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    const data = await pdf(dataBuffer);
    const contractText = data.text;

    const analysisResult = await analyzeContract(contractText);

    fs.unlinkSync(filePath);

    if (
      analysisResult.status === "success" &&
      Array.isArray(analysisResult.analysis)
    ) {
      const negotiationDraft = await generateNegotiationEmailDraft(
        analysisResult.analysis
      );

      if (setupNotion) {
        await createNotionPage(analysisResult.analysis, negotiationDraft);
      }
    }

    res.json({ analysis: analysisResult });
  } catch (err) {
    console.error("Error in uploadContract:", err);
    res.status(500).json({ error: "Error processing contract" });
  }
};
