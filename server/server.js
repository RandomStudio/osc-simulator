// ----------------------------------------------------------------------------
// Logging with pretty colours and configurable level
// ----------------------------------------------------------------------------
const logger = require('winston-color');
logger.transports.console.level = 'verbose';

// ----------------------------------------------------------------------------
// OSC stuff
// ----------------------------------------------------------------------------
const osc = require('node-osc');
const PORT = 12345;

let socketClient = null;

const oscServer = new osc.Server(PORT, '0.0.0.0');

oscServer.on("message", function (msg, rinfo) {
  logger.info("received OSC message:", msg);
  if (socketClient) {
    socketClient.emit('message', msg);
  }
});

logger.info('OSC server listening on port', PORT);

function sendOsc(address, data) {
  var client = new osc.Client('127.0.0.1', 12345);
  client.send(address, data, () => {
    logger.silly('OSC send OK');
    client.kill();
  });
}

// ----------------------------------------------------------------------------
// WebSocket stuff
// ----------------------------------------------------------------------------
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
    sendOsc(data.address, data.data)
  });
});


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
      sendOsc('dummy/', 'fromcli');

    break;

    default:
      console.log('unknown command');

  }
});
