const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const toolRoutes = require('./routes/toolRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const offboardingRoutes = require('./routes/offboardingRoutes');
const renewalRoutes = require('./routes/renewalRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const shadowITRoutes = require('./routes/shadowITRoutes');
const overlapRoutes = require('./routes/overlapRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const contractRoutes = require('./routes/contractRoutes');
const benchmarkRoutes = require('./routes/benchmarkRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const userRoutes = require('./routes/userRoutes');

// Import cron
const renewalCron = require('./cron/renewalCron');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Middleware
// ============================================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/offboarding', offboardingRoutes);
app.use('/api/renewals', renewalRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/shadow-it', shadowITRoutes);
app.use('/api/overlaps', overlapRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/benchmarks', benchmarkRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/users', userRoutes);
