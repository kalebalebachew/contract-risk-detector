const fs = require('fs');
const pdf = require('pdf-parse');
const { analyzeContract } = require('../services/geminiService');

exports.uploadContract = async (req, res) => {
  try {
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    
    const data = await pdf(dataBuffer);
    const contractText = data.text;
    
    const analysis = await analyzeContract(contractText);
    
    fs.unlinkSync(filePath);
    
    res.json({ analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing contract' });
  }
};
