var express = require('express');
var router = express.Router();
var RoombieServiceClass = require('../services/roombie-service');
var service = new RoombieServiceClass();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/off', (req, res, next) => {
  service.sendCommand({ command: 'OFF' });
  res.send('off requested');
});

router.get('/on', (req, res, next) => {
  service.sendCommand({ command: 'ON' });
  res.send('on requested');
});

/**
 * handling of general command
 */
router.post('/', (req, res, next) => {
  const payload = req.body; // {command: 'do-something'}
  service.sendCommand(payload);
  res.send('command requested');
});

module.exports = router;
