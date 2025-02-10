const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
const cors = require('cors')

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.urlencoded({extended:false}));
const io = socketIo(server ,{
    cors: {
        origin: '*', // Autoriser toutes les origines
        methods: ['GET', 'POST'], // Méthodes autorisées
    },
});

// Connexion à Redis
const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

redisClient.on('error', (err) => {
    console.error('Erreur Redis:', err);
});

// Connexion asynchrone à Redis
async function connectRedis() {
    try {
       //  redisClient.connect();
        // console.log('Connecté à Redis');

        await redisClient.connect().then(() => {
            console.log('Connecté à Redis');
        }).catch((err) => {
            console.error('Erreur de connexion à Redis:', err);
        });

        redisClient.subscribe('test_channel', (message) => {
            console.log(`Message reçu sur subscribe: ${message}`);
            const parsedMessage = JSON.parse(message);
            console.log("message ", parsedMessage);
            io.emit('new_message', parsedMessage); // Diffusion via Socket.IO
            console.log("message emit");
        });
         
    } catch (error) {
        console.error('Erreur de connexion Redis:', error);
    }
}

connectRedis();

// Configuration des WebSockets
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    // Écoute des événements de type "sendMessage"
    socket.on('sendMessage', (data) => {
        console.log('Message reçu:', data);

        // Diffusion du message à tous les clients
        io.emit('new_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

// Démarrer le serveur
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Serveur WebSocket en cours d'exécution sur le port ${PORT}`);
});


//redisClient.subscribe('test_channel'); // Souscription au canal Redis
         //console.log('Souscription au canal test_channel');
        /*
        redisClient.on('new_message', (channel, message) => {
            console.log(`Message reçu sur ${channel}: ${message}`);
            try {
                // Assurez-vous que le message est bien parsé s'il est en JSON
                const parsedMessage = JSON.parse(message);
                io.emit('new_message', parsedMessage); // Diffusion via Socket.IO
            } catch (err) {
                console.error('Erreur de parsing JSON:', err);
            }
        } );*/