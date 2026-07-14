const AstroToolsLog = require('../models/AstroToolsLog');

// Log when astrologer starts using Astro Tools
exports.logStart = async (req, res) => {
  try {
    const { phoneUsed } = req.body;
    if (!phoneUsed) {
      return res.status(400).json({ message: 'Phone number used is required' });
    }

    const today = new Date();
    const accessDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const log = new AstroToolsLog({
      astrologerId: req.user._id,
      astrologerName: req.user.name,
      phoneUsed,
      startTime: today,
      accessDate
    });

    const savedLog = await log.save();
    res.status(201).json({
      success: true,
      logId: savedLog._id
    });
  } catch (error) {
    console.error('Error logging Astro Tools start:', error);
    res.status(500).json({ message: 'Server error logging access start' });
  }
};

// Log when astrologer stops using Astro Tools (closes tab)
exports.logEnd = async (req, res) => {
  try {
    const { logId } = req.params;
    
    const log = await AstroToolsLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    log.endTime = new Date();
    await log.save();

    res.json({ success: true, message: 'Access session end logged successfully' });
  } catch (error) {
    console.error('Error logging Astro Tools end:', error);
    res.status(500).json({ message: 'Server error logging access end' });
  }
};

// Get aggregated day-wise report for admin
exports.getAuditReport = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    const report = await AstroToolsLog.aggregate([
      {
        $group: {
          _id: { date: "$accessDate", name: "$astrologerName" },
          useCount: { $sum: 1 },
          sessions: { 
            $push: { 
              logId: "$_id",
              startTime: "$startTime", 
              endTime: "$endTime", 
              phone: "$phoneUsed" 
            } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          astrologerName: "$_id.name",
          useCount: 1,
          sessions: 1
        }
      },
      { $sort: { date: -1, astrologerName: 1 } }
    ]);

    res.json({ success: true, report });
  } catch (error) {
    console.error('Error fetching audit report:', error);
    res.status(500).json({ message: 'Server error fetching audit report' });
  }
};
