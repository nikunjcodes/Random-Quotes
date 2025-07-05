const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quotes-app');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/quotes', require('./routes/quotes'));

app.listen(3000, () => console.log('Server running on port 3000'));
