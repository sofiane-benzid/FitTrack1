const validateMessage = (req, res, next) => {
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      message: 'Message content cannot be empty'
    });
  }

  if (content.length > 1000) {
    return res.status(400).json({
      message: 'Message content cannot exceed 1000 characters'
    });
  }

  next();
};

const validatePartnership = (req, res, next) => {
  const { partnerId, reminderPreferences } = req.body;

  if (!partnerId) {
    return res.status(400).json({
      message: 'Partner ID is required'
    });
  }

  if (reminderPreferences) {
    const { frequency, time } = reminderPreferences;
    
    if (frequency && !['daily', 'weekly', 'custom'].includes(frequency)) {
      return res.status(400).json({
        message: 'Invalid reminder frequency'
      });
    }

    if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return res.status(400).json({
        message: 'Invalid time format. Use HH:MM format'
      });
    }
  }

  next();
};


module.exports = {
  validateMessage,
  validatePartnership
};