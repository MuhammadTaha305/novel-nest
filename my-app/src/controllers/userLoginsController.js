// Controller to fetch user login events for the admin dashboard
const { getDB } = require('../config/db');

// Get user logins for the last 30 days, grouped by day
const getUserLogins = async (req, res) => {
  try {
    const { userLoginsCollection } = getDB();
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); // 30 days ago

    // Aggregate logins by day
    const pipeline = [
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
    const results = await userLoginsCollection.aggregate(pipeline).toArray();

    // Format as { date, count }
    const logins = results.map(r => ({ date: r._id, count: r.count }));
    res.json({ success: true, logins });
  } catch (error) {
    console.error('Error fetching user logins:', error);
    res.status(500).json({ success: false, message: 'Error fetching user logins' });
  }
};

module.exports = { getUserLogins };
