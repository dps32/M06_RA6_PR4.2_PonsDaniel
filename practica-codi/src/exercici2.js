// Importacions
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Constants
const DATA_SUBFOLDER = 'steamreviews';
const CSV_GAMES_FILE_NAME = 'games.csv';
const CSV_REVIEWS_FILE_NAME = 'reviews.csv';

// Funció per llegir el CSV de forma asíncrona
async function readCSV(filePath) {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Funció per fer la petició a Ollama amb més detalls d'error
async function analyzeSentiment(text) {
    try {
        console.log('Enviant petició a Ollama...');
        console.log('Model:', process.env.CHAT_API_OLLAMA_MODEL_TEXT);
        
        const response = await fetch(`${process.env.CHAT_API_OLLAMA_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: process.env.CHAT_API_OLLAMA_MODEL_TEXT,
                prompt: `Analyze the sentiment of this text and respond with only one word (positive/negative/neutral): "${text}"`,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Depuració de la resposta
        console.log('Resposta completa d\'Ollama:', JSON.stringify(data, null, 2));
        
        // Verificar si tenim una resposta vàlida
        if (!data || !data.response) {
            throw new Error('La resposta d\'Ollama no té el format esperat');
        }

        return data.response.trim().toLowerCase();
    } catch (error) {
        console.error('Error detallat en la petició a Ollama:', error);
        console.error('Detalls adicionals:', {
            url: `${process.env.CHAT_API_OLLAMA_URL}/generate`,
            model: process.env.CHAT_API_OLLAMA_MODEL_TEXT,
            promptLength: text.length
        });
        return 'error';
    }
}

async function main() {
    try {
        // Obtenim la ruta del directori de dades
        const dataPath = process.env.DATA_PATH;

        // Validem les variables d'entorn necessàries
        if (!dataPath) {
            throw new Error('La variable d\'entorn DATA_PATH no està definida');
        }
        if (!process.env.CHAT_API_OLLAMA_URL) {
            throw new Error('La variable d\'entorn CHAT_API_OLLAMA_URL no està definida');
        }
        if (!process.env.CHAT_API_OLLAMA_MODEL_TEXT) {
            throw new Error('La variable d\'entorn CHAT_API_OLLAMA_MODEL_TEXT no està definida');
        }

        // Construïm les rutes completes als fitxers CSV
        const gamesFilePath = path.join(__dirname, dataPath, DATA_SUBFOLDER, CSV_GAMES_FILE_NAME);
        const reviewsFilePath = path.join(__dirname, dataPath, DATA_SUBFOLDER, CSV_REVIEWS_FILE_NAME);

        // Validem si els fitxers existeixen
        if (!fs.existsSync(gamesFilePath) || !fs.existsSync(reviewsFilePath)) {
            throw new Error('Algun dels fitxers CSV no existeix');
        }

        // Llegim els CSVs
        const games = await readCSV(gamesFilePath);
        const reviews = await readCSV(reviewsFilePath);

        // Iterem pels jocs
        console.log('\n=== Llista de Jocs ===');
        for (const game of games) {
            console.log(`Codi: ${game.appid}, Nom: ${game.name}`);
        }

        // Iterem per les primeres 10 reviews i analitzem el sentiment
        console.log('\n=== Anàlisi de Sentiment de Reviews ===');
        const reviewsToAnalyze = reviews.slice(0, 2);
        
        for (const review of reviewsToAnalyze) {
            console.log(`\nProcessant review: ${review.id}`);
            const sentiment = await analyzeSentiment(review.content);
            console.log(`Review ID: ${review.id}`);
            console.log(`Joc ID: ${review.app_id}`);
            console.log(`Contingut: ${review.content.substring(0, 100)}...`);
            console.log(`Sentiment (Ollama): ${sentiment}`);
            console.log('------------------------');
        }
        console.log(`\nNOMÉS AVALUEM LES DUES PRIMERES REVIEWS`);
     } catch (error) {
        console.error('Error durant l\'execució:', error.message);
    }
}

// Executem la funció principal
main();
