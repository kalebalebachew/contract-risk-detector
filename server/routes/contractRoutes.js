const express = require('express');
const router = express.Router();
const multer = require('multer');
const contractController = require('../controllers/contractController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('contract'), contractController.uploadContract);

module.exports = router;
