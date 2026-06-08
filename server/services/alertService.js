const nodemailer = require('nodemailer');
const pool = require('../db/connection');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send a renewal alert email for a specific tool
 * @param {Object} tool - { id, tool_name, renewal_date, total_monthly_cost, auto_renewal }
 * @param {string} alertType - '90_day', '60_day', or '30_day'
 * @returns {boolean} true if sent, false if skipped (duplicate)
 */
async function sendRenewalAlert(tool, alertType) {
  // Check if alert already sent
  const [existing] = await pool.execute(
    'SELECT id FROM renewal_alerts WHERE tool_id = ? AND alert_type = ?',
    [tool.id, alertType]
  );

  if (existing.length > 0) {
    return false; // Already sent, skip
  }

  const daysLabel = alertType.replace('_day', '');
  const subject = `⚠️ Spendix: ${tool.tool_name} renews in ${daysLabel} days`;
  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0F172A;">Renewal Alert: ${tool.tool_name}</h2>
      <p style="color: #64748B;">This tool is renewing in <strong>${daysLabel} days</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0; color: #64748B;">Tool</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; font-weight: 600;">${tool.tool_name}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0; color: #64748B;">Renewal Date</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${tool.renewal_date}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0; color: #64748B;">Monthly Cost</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">₹${parseFloat(tool.total_monthly_cost).toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #E2E8F0; color: #64748B;">Auto-Renewal</td>
            <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${tool.auto_renewal ? 'Yes ⚠️' : 'No'}</td></tr>
      </table>
      <p style="color: #64748B;">Review this renewal in your <a href="http://localhost:5173/renewals" style="color: #6366F1;">Spendix Dashboard</a>.</p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
      <p style="color: #94A3B8; font-size: 12px;">Sent by Spendix — SaaS Intelligence Platform</p>
    </div>
  `;
  try {
    await transporter.sendMail({
      from: process.env.ALERT_EMAIL_FROM || 'alerts@spendix.in',
      to: process.env.ALERT_EMAIL_TO || 'admin@yourcompany.com',
      subject,
      html
    });

    // Log the alert
    await pool.execute(
      'INSERT INTO renewal_alerts (tool_id, alert_type) VALUES (?, ?)',
      [tool.id, alertType]
    );

    console.log(`✅ Renewal alert sent: ${tool.tool_name} (${alertType})`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send alert for ${tool.tool_name}:`, err.message);
    return false;
  }
}

/**
 * Process all renewal alerts — check tools within 90 days and send appropriate alerts
 * @returns {number} Number of alerts sent
 */
async function processRenewalAlerts() {
  const [tools] = await pool.execute(
    `SELECT id, tool_name, renewal_date, total_monthly_cost, auto_renewal
     FROM saas_tools
     WHERE renewal_date IS NOT NULL
     AND renewal_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)`
  );

  let alertsSent = 0;

  for (const tool of tools) {
    const daysUntil = Math.ceil(
      (new Date(tool.renewal_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    let alertType = null;
    if (daysUntil <= 30) alertType = '30_day';
    else if (daysUntil <= 60) alertType = '60_day';
    else if (daysUntil <= 90) alertType = '90_day';

    if (alertType) {
      const sent = await sendRenewalAlert(tool, alertType);
      if (sent) alertsSent++;
    }
  }

  return alertsSent;
}

module.exports = { sendRenewalAlert, processRenewalAlerts };
