const cron = require('node-cron');
const appointmentController = require('../controllers/appointmentController');

// Function to start the reminder scheduler
const startReminderScheduler = () => {
  // Run reminder check every minute
  cron.schedule('* * * * *', async () => {
    console.log('Checking for appointment reminders...');
    await appointmentController.checkAndSendReminders();
  });

  console.log('🔔 Appointment reminder scheduler started - checking every minute');
};

module.exports = {
  startReminderScheduler
};