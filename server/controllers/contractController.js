const fs = require('fs');
const pdf = require('pdf-parse');

exports.uploadContract = async (req, res) => {
  const filePath = req.file.path;
  const dataBuffer = fs.readFileSync(filePath);

  pdf(dataBuffer).then(function(data) {
    const contractText = data.text;
    // TODO: Send contractText to Gemini API for analysis 
    
    res.json({ text: contractText });
  }).catch(err => {
    res.status(500).json({ error: 'Error parsing PDF' });
  });
};
