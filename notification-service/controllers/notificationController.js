let notifications = [];

// Send notification
exports.sendNotification = (req, res) => {
  const { userId, type, title, message } = req.body;
  
  if (!userId || !type || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newNotification = {
    id: notifications.length + 1,
    userId,
    type,
    title: title || type,
    message,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.push(newNotification);
  
  console.log(`Sending notification to user ${userId}: ${title} - ${message}`);
  res.status(201).json(newNotification);
};

// Get user notifications
exports.getUserNotifications = (req, res) => {
  const userId = req.params.userId;
  const userNotifications = notifications.filter(n => n.userId == userId);
  
  res.json(userNotifications);
};

// Send push notification
exports.sendPushNotification = (req, res) => {
  const { userId, title, message, data } = req.body;
  
  if (!userId || !title || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // In a real app, this would use a push notification service
  console.log(`Sending push notification to user ${userId}: ${title} - ${message}`);
  
  res.json({ 
    success: true, 
    message: `Push notification sent to user ${userId}` 
  });
};