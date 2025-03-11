const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const contractRoutes = require('./routes/contractRoutes');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
});

app.use('/api/contracts', contractRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
