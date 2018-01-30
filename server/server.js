// ----------------------------------------------------------------------------
// Config with defaults
// ----------------------------------------------------------------------------
const config = require('rc')('osc-simulator', {
  standalone: false,
  sending: {
    ip: '127.0.0.1',
    port: 12345
  },
  receiving: {
    ip: '127.0.0.1',
    port: '12345'
  },
  webSocket: {
    port: 5000
  },
  loglevel: 'verbose'
});

// ----------------------------------------------------------------------------
// Logging with pretty colours and configurable level
// ----------------------------------------------------------------------------
const logger = require('winston-color');
logger.transports.console.level = config.loglevel;

// ----------------------------------------------------------------------------
// Log if standalone mode
// ----------------------------------------------------------------------------
if (config.standalone) {
  logger.info('standalone mode: will only use CLI, no websocket');
}

// ----------------------------------------------------------------------------
// OSC stuff
// ----------------------------------------------------------------------------
const osc = require('node-osc');

logger.info('will send to', config.sending);
logger.info('will listen on', config.receiving);

let socketClient = null;

const oscServer = new osc.Server(config.receiving.port, config.receiving.ip);

oscServer.on("message", function (msg, rinfo) {
  logger.info("received OSC message:", msg);
  if (socketClient && !config.standalone) { // only relay if connected and NOT in standalone mode
    socketClient.emit('message', msg);
  }
});

function sendOsc(address, data, ip, port) {
  logger.info(`sendOsc ${ip}:${port} to address ${address}: ${JSON.stringify(data)}`);
  logger.debug('data type:', typeof(data));
  let client = new osc.Client(ip, port);

  client.send(address, data, (err) => {
    if (err) {
      logger.error('OSC error:', err);
    } else {
      logger.silly('OSC send OK');
    }
    client.kill();
  });
}

// ----------------------------------------------------------------------------
// WebSocket stuff
// ----------------------------------------------------------------------------
if (!config.standalone) {
  const server = require('http').createServer();

  const io = require('socket.io')(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });

  server.listen(config.webSocket.port);
  logger.info('WebSocket server listening on port', config.webSocket.port);

  io.on('connection', (socket) => {
    logger.info('connected to client websocket:', socket.id);
    socketClient = socket;

    socket.emit('configuration', { sending: config.sending, receiving: config.receiving });

    socket.on('message', (data) => {
      logger.verbose('Websocket -> OSC', data, typeof data);
      // use the IP and PORT from backend config, address and payload from front-end message
      sendOsc(data.address, data.data, config.sending.ip, config.sending.port)
    });
  });
}


// ----------------------------------------------------------------------------
// Interactive CLI stuff
// ----------------------------------------------------------------------------

const stdin = process.openStdin();

stdin.addListener("data", (d) => {
  let input = d.toString().trim();
  logger.silly(`checking input [${input}]`);
  switch(input) {

    case 'dummy':
      console.log(`send /dummy "fromcli"`);
      sendOsc('dummy', 'fromcli');

    break;

    default:
      console.log('unknown command');

  }
});
