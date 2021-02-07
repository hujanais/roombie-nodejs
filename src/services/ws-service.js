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
    this.interval;
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
        ws.isAlive = true;
        this.espWSS = ws;

        console.log('connection');

        // Handle situation when the ESP gets disconnected using ping-pong.
        // This time, the server will send a ping and waits for a pong within a certain time.
        this.interval = setInterval(() => {
          if (!this.espWSS.isAlive) return this.espWSS.terminate();
          this.espWSS.isAlive = false; // set isAlive flag to false and wait for the pong to reset it.
          this.espWSS.ping();
        }, 5000);

        // handle new messages from the ESP and relay the data to all connected clients.
        this.espWSS.on('message', (msg) => {
          this.wssClients.forEach((ws) => {
            ws.send(`${msg}`);
          });
        });

        // The ESP sends a ping and the server returns a pong to satisfy heartbeat on the ESP side.
        this.espWSS.on('ping', () => {
          console.log('ping');
          this.espWSS.pong(null);
        });

        // When pong is received, reset the isAlive flag to true.
        this.espWSS.on('pong', () => {
          console.log('pong');
          this.espWSS.isAlive = true;
        });

        this.espWSS.on('close', () => {
          console.log('the ESP has disconnected');
          clearInterval(this.interval);
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
