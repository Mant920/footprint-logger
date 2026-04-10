const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// GET /api/users/profile
router.get('/profile', (req, res) => {
  res.json({ success: true, user: req.user });
});

// PATCH /api/users/goal
router.patch('/goal', async (req, res) => {
  try {
    const { weeklyGoal } = req.body;
    if (!weeklyGoal || weeklyGoal < 0) {
      return res.status(400).json({ success: false, message: 'Valid weekly goal required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { weeklyGoal },
      { new: true }
    );

    res.json({ success: true, user, message: 'Weekly goal updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating goal.' });
  }
});

module.exports = router;
