const express = require('express');
const router = express.Router();
const {
  getHeaderData,
  markRead,
  markAllAsRead,
  getWallet,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/headerController');

router.get('/info', getHeaderData);

router.get('/wallet', getWallet);

router.put('/notification/:id', markRead);

router.put('/notifications/read-all', markAllAsRead);

router.delete('/notification/:id', deleteNotification);

router.delete('/notifications', clearAllNotifications);

module.exports = router;