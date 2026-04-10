const express = require('express');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/activities - get user's activities with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 50 } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'all') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching activities.' });
  }
});

// POST /api/activities - log a new activity
router.post('/', async (req, res) => {
  try {
    const { name, category, co2Amount, quantity, unit, notes, date } = req.body;

    if (!name || !category || co2Amount === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, and CO2 amount are required.' });
    }

    const activity = await Activity.create({
      userId: req.user._id,
      name, category, co2Amount, quantity, unit, notes,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({ success: true, data: activity, message: 'Activity logged!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving activity.' });
  }
});

// DELETE /api/activities/:id
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    res.json({ success: true, message: 'Activity deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting activity.' });
  }
});

// GET /api/activities/stats - summary statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // This week (Mon-Sun)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Last 7 days
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    // All-time totals by category
    const categoryTotals = await Activity.aggregate([
      { $match: { userId } },
      { $group: {
        _id: '$category',
        total: { $sum: { $multiply: ['$co2Amount', '$quantity'] } },
        count: { $sum: 1 }
      }}
    ]);

    // Weekly totals (last 7 days by day)
    const weeklyData = await Activity.aggregate([
      { $match: { userId, date: { $gte: last7Days } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: { $multiply: ['$co2Amount', '$quantity'] } }
      }},
      { $sort: { _id: 1 } }
    ]);

    // All-time total
    const allTimeAgg = await Activity.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$co2Amount', '$quantity'] } } } }
    ]);

    // This week total
    const weekAgg = await Activity.aggregate([
      { $match: { userId, date: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$co2Amount', '$quantity'] } } } }
    ]);

    // Community average (average of all users this week)
    const communityAgg = await Activity.aggregate([
      { $match: { date: { $gte: startOfWeek } } },
      { $group: { _id: '$userId', total: { $sum: { $multiply: ['$co2Amount', '$quantity'] } } } },
      { $group: { _id: null, avg: { $avg: '$total' }, userCount: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        allTimeTotal: allTimeAgg[0]?.total || 0,
        weeklyTotal: weekAgg[0]?.total || 0,
        categoryTotals,
        weeklyData,
        communityAvg: communityAgg[0]?.avg || 0,
        communityUserCount: communityAgg[0]?.userCount || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
});

module.exports = router;
