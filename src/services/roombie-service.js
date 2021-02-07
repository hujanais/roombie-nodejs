'use strict';

const wss = require('../services/ws-service');

module.exports = class RoombieService {
  constructor() {
    console.log('ctor RoombieService');

    wss.observable.subscribe((obs) => {
      console.log(obs);
    });
  }

  /**
   * Send command
   * @param {ICommand} cmd
   */
  sendCommand(cmd) {
    wss.sendCommand(cmd);
  }
};
