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
    ip: '0.0.0.0',
    port: 12345
  },
  webSocket: {
    port: 5000
  },
  logging: { 
    level: 'verbose',
    colorize: true,
    toFile: false,
    frontEndMessages: true,
    suppressIncoming: false
  }
});

// ----------------------------------------------------------------------------
// Logging with pretty colours and configurable level
// ----------------------------------------------------------------------------
const winston = require('winston');
const logger = new winston.Logger({
  level: config.logging.level,
  transports: [
    new (winston.transports.Console)({
      colorize: config.logging.colorize
    })
  ]
});
if (config.logging.toFile) {
  logger.add(winston.transports.File, {
    filename: 'server.log',
    timestamp: true,
    level: 'debug',
    json: false,
    showLevel: false
  });
}

// ----------------------------------------------------------------------------
// Log some important things on startup
// ---------------------------------------------------------------------------
logger.debug('**************** startup osc-simulator server at', new Date());
if (config.standalone) {
  logger.info('standalone mode: will only use CLI, no websocket');
}
logger.info('will send to', config.sending);
logger.info('will listen on', config.receiving);

// ----------------------------------------------------------------------------
// OSC stuff
// ----------------------------------------------------------------------------
const osc = require('node-osc');

let socketClient = null;

const oscServer = new osc.Server(config.receiving.port, config.receiving.ip);

oscServer.on("message", function (msg, rinfo) {
  if (!config.logging.suppressIncoming) {
    logger.info("received OSC message:", msg);
  }
  if (socketClient && !config.standalone) { // only relay if connected and NOT in standalone mode
    socketClient.emit('message', msg);
  }
});

function sendOsc(address, data, ip, port) {
  logger.info(`sendOsc ${ip}:${port} to address ${address}: ${JSON.stringify(data)}`);
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

    socket.emit('configuration', { 
      sending: config.sending, 
      receiving: config.receiving, 
      frontEndMessages: config.logging.frontEndMessages 
    });

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
  let input = d.toString().trim().split(' ');
  let command = input[0];
  let add = input[1];
  let args = input.slice(2);
  logger.silly(`checking input [${input}]`);
  switch(command) {

    case 'dummy':
      logger.info(`send /dummy "fromcli"`);
      sendOsc('/dummy', 'fromcli', config.sending.ip, config.sending.port);
      break;

    case 'send':
      logger.info(`send to ${add}: ${args}`);
      sendOsc(add, autoType(args), config.sending.ip, config.sending.port);
      break;

    default:
      logger.info('unknown command');

  }
});

const autoType = (arr) => arr.map(value => isNaN(parseFloat(value)) ? value : parseFloat(value));