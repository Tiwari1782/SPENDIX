const cron = require('node-cron');
const { processRenewalAlerts } = require('../services/alertService');

// Run daily at 8:00 AM
const renewalCronJob = cron.schedule('0 8 * * *', async () => {
  console.log('🕐 Running daily renewal check...');
  try {
    const alertsSent = await processRenewalAlerts();
    console.log(`✅ Renewal cron complete: ${alertsSent} alert(s) sent`);
  } catch (err) {
    console.error('❌ Renewal cron error:', err.message);
  }
}, {
  scheduled: false // Don't start automatically, we'll start in index.js
});

module.exports = renewalCronJob;
