const cron = require('node-cron');
const Goal = require('../models/goal.model');

cron.schedule('0 0 * * *', async () => {
  try {
    const goals = await Goal.find();
    for (let goal of goals) {
      const today = new Date().toDateString();
      const lastCompleted = goal.lastCompleted ? goal.lastCompleted.toDateString() : null;
      if (today !== lastCompleted) {
        goal.completedToday = false;
      }
      await goal.save();
    }
    console.log('Daily goal reset completed');
  } catch (err) {
    console.error('Goal scheduler error:', err);
  }
});