const express = require('express');
const router = express.Router();
const goalController = require('../../controllers/goal.controller');

router.post('/create', goalController.createGoal);
router.patch('/complete/:goalId', goalController.markComplete);
router.get('/email/:email', goalController.getUserGoals);
router.delete('/:goalId',  goalController.deleteGoal);

module.exports = router;