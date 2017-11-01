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

const oscServer = new osc.Server(PORT, '0.0.0.0');
oscServer.on("message", function (msg, rinfo) {
  logger.verbose("received OSC message:", msg);
});

logger.info('OSC server listening on port', PORT);

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

  socket.on('dummy', (data) => {
    logger.verbose('Websocket -> OSC', data);
    var client = new osc.Client('127.0.0.1', 12345);
    client.send('dummy', data.arg, () => {
      logger.silly('OSC send OK');
      client.kill();
    });
  });
});
