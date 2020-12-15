var net = require('net');

var port = 4444;

var server = net.createServer(function (socket) {

  socket.on('data', function (data) {
    console.log("Recibi solicitud de cliente");
    // tiempo de arribo del cliente
    var T2 = (new Date()).toISOString();

    // tiempo de envío del servidor
    var T3 = (new Date()).toISOString();
    console.log("Se envia tiempo al cliente...");
    socket.write(JSON.stringify({ t1: JSON.parse(data).t1, t2 : T2, t3: T3}));
  });

  socket.on('error', (err) => {
    console.log(err);
  })

});

server.listen(port, () => {
  console.log("Servidor NTP escuchando en puerto:" , port);
});

