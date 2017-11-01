// ----------------------------------------------------------------------------
// Logging with pretty colours and configurable level
// ----------------------------------------------------------------------------
const logger = require('winston-color');
logger.transports.console.level = 'verbose';

// ----------------------------------------------------------------------------
// Command line arguments, standalone mode
// ----------------------------------------------------------------------------
let STANDALONE = false;
const argv = require('yargs').argv
if (argv.standalone) {
  logger.info('standalone mode: will only use CLI, no websocket');
  STANDALONE = true;
}

// ----------------------------------------------------------------------------
// OSC stuff
// ----------------------------------------------------------------------------
const osc = require('node-osc');
let destination = {
  ip: argv.destinationIp || "127.0.0.1",
  port: argv.destinationPort || 12345
}
let listen = {
  ip: argv.listenIp || "0.0.0.0",
  port: argv.listenPort || destination.port
}
logger.info('will send to', destination);
logger.info('will listen on', listen);

let socketClient = null;

const oscServer = new osc.Server(listen.port, listen.ip);

oscServer.on("message", function (msg, rinfo) {
  logger.info("received OSC message:", msg);
  if (socketClient && !STANDALONE) {
    socketClient.emit('message', msg);
  }
});

function sendOsc(address, data, ip = '127.0.0.1', port = 12345) {
  var client = new osc.Client(ip, port);
  client.send(address, data, () => {
    logger.silly('OSC send OK');
    client.kill();
  });
}

// ----------------------------------------------------------------------------
// WebSocket stuff
// ----------------------------------------------------------------------------
if (!STANDALONE) {
  const WS_PORT = 5000;
  const server = require('http').createServer();

  const io = require('socket.io')(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });

  server.listen(WS_PORT);
  logger.info('WebSocket server listening on port', WS_PORT);

  io.on('connection', (socket) => {
    logger.info('connected to client websocket:', socket.id);
    socketClient = socket;

    socket.on('message', (data) => {
      logger.verbose('Websocket -> OSC', data);
      sendOsc(data.address, data.data, data.ip, data.port)
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
