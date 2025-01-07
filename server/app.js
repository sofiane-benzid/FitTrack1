const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDatabase = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/activity', activityRoutes);
app.use('/nutrition', nutritionRoutes);

// Connect to database
connectDatabase();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;