const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ruta principal que serveix l'HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.XAT_WEB_PORT || 3001;
const HOST = process.env.XAT_WEB_HOST || '127.0.0.1';

const server = app.listen(PORT, HOST, () => {
    const { address, port } = server.address();
    const host = address === '::' ? 'localhost' : address;
    console.log(`Servidor executant-se a http://${host}:${port}`);
});