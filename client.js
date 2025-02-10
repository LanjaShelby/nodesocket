const io = require('socket.io-client');

// Connexion au serveur
const socket = io('http://localhost:4000');

console.log('socket reçu du serveur');

// Écoute des messages Redis via Socket.IO
socket.on('new_message', (data) => {
    console.log('Message reçu du serveur:', data);
    console.log('get  du serveur');
});

// Simule une déconnexion après 10 secondes
setTimeout(() => {
    socket.disconnect();
    console.log('Client déconnecté');
}, 10000);
