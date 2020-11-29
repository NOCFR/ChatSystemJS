"use strict";
const fs = require('fs');
const zmq = require('zeromq');
const subSocket = zmq.socket('xsub');
const pubSocket = zmq.socket('xpub');
const responder = zmq.socket('rep');
const readline = require('readline');

var id_broker;
var direccion = 'tcp://127.0.0.1:';
var portRR;
var portSUB;
var portPUB;
var listaTopicos = [];
var intervalo = 120; // 120 segundos

var puertoNTP = 4444
var hostNTP = 'localhost' //'127.0.0.1'; // 


//FALTA EL PUERTO PARA EL NTP

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('\n Ingresa el id del broker (puede ser 1, 2 o 3) \n', (idBroker) => {
    assignPort(idBroker);
    rl.close();
});

function assignPort(idB) {

    let file;

    id_broker = 'broker/' + idB;
    fs.readFile('configuracion.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
        file = data.split(',');

        let i = file.indexOf('broker/'+idB);
        portSUB = direccion.concat(file[i+1]);
        subSocket.bindSync(portSUB);
        portPUB = direccion.concat(file[i + 2]);
        pubSocket.bindSync(portPUB);
        portRR = direccion.concat(file[i + 3]);
        responder.bind(portRR);
        console.log('Puertos:\n PUB: ' + portPUB + '\n portSUB: ' + portSUB + '\n portRR: ' + portRR);
    });
}


// Redirige todos los mensajes que recibimos
subSocket.on('message', function (topic, message) {
    if (listaTopicos.includes(topic)) {
        pubSocket.send([topic, message]);
    } else {
        console.log('llego un topico que no se maneja con este broker');
    }
});

// Cuando el pubSocket recibe un tópico, subSocket debe subscribirse a él; para eso se utiliza el método send
pubSocket.on('message', function (topic) {
    subSocket.send(topic)
});

responder.on('message', (request) => {
    // Tiene que incluir dentro de su lista el nuevo topico que le envió el coordinador. 
    let req = request.toString();
    req = JSON.parse(req);
    console.log('Llego un mensaje con: ', req);
    listaTopicos.push(req.topico);
    console.log('lista de topicos: ', listaTopicos);
    responder.send('Fue agregado el topico');
})
/*
var clienteNTP = net.createConnection(puertoNTP, "127.0.0.1", function () {
    setInterval(() => {

        var T1 = (new Date()).getTime().toISOString();
        console.log("Escribiendo desde cliente " + id_cliente + "...")
        clienteNTP.write(JSON.stringify({
            t1: T1
        }));

    }, intervalo * 1000);
});


clienteNTP.on('data', function (data) {
    console.log("Cliente " + id_cliente + " Se recibio respuesta de servidor NTP.")
    var T4 = (new Date()).getTime();


    // Obtenemos la hora del servidor
    var times = JSON.parse(data);
    var T1 = (new Date(times.t1)).getTime();
    var T2 = (new Date(times.t2)).getTime();
    var T3 = (new Date(times.t3)).getTime();

    // calculamos delay de la red
    delay = ((T2 - T1) + (T4 - T3)) / 2;
    console.log("Delay calculado para cliente " + id_cliente + ": " + delay);
});*/