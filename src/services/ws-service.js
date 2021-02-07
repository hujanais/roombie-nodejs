const WebSocket = require('ws');
const uuidv4 = require('uuidv4');
const { Subject } = require('rxjs');
const ICommand = require('../models/icommand');

class WSService {
  constructor() {
    this.wss = {};
    this.espWSS;
    this.wssClients = new Map();
    this.subject = new Subject();
    console.log('ctor WSService');
  }

  /**
   * Initialize the websocket pipe.
   */
  init() {
    console.log('initialize wss');
    this.wss = new WebSocket.Server({ port: 8888 });

    this.wss.on('connection', (ws, req) => {
      const id = req.url.replace('/', '');
      if (id === 'esp') {
        // this is the ESP.
        ws.id = 'esp';
        this.espWSS = ws;

        this.espWSS.on('message', (msg) => {
          this.wssClients.forEach((ws) => {
            ws.send(`${msg}`);
          });
        });
      } else {
        // when connection arrives, assigned a guid to this client and store this off in a map.
        ws.id = uuidv4.uuid();
        this.wssClients.set(ws.id, ws);

        // ws.on('message', (msg) => {
        //   console.log(`${ws.id}: ${msg}`);
        //   const cmd = new ICommand();
        //   cmd.command = msg;
        //   this.subject.next(cmd);
        // });
      }

      ws.on('close', (code, message) => {
        this.wssClients.delete(ws.id);
        console.log(`wss.close: ${ws.id}, ${code}. ${message}`);
      });

      console.log(`New Connection: ${ws.id}, ${req.url}, ${req.connection.remoteAddress}`);

      ws.send(`Welcome, ${ws.id}`);
    });
  }

  /**
   * Send the command out.
   * @param {ICommand} cmd
   */
  sendCommand(cmd) {
    this.espWSS.send(`${cmd.command}`);
  }

  get observable() {
    return this.subject.asObservable();
  }
}

const instance = new WSService();
module.exports = instance;
