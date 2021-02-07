var express = require('express');
var router = express.Router();
var RoombieServiceClass = require('../services/roombie-service');
var service = new RoombieServiceClass();
var ICommand = require('../models/icommand');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/off', (req, res) => {
  const cmd = new ICommand('OFF');
  service.sendCommand(cmd);
  res.send('off requested');
});

router.get('/on', (req, res) => {
  const cmd = new ICommand('ON');
  service.sendCommand(cmd);
  res.send('on requested');
});

module.exports = router;
