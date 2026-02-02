// Importacions
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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
                prompt: `Analyze the sentiment of this game review and respond with ONLY ONE of these three words: positive, negative, or neutral. Do not include any additional text.\n\nText: "${text}"`,
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

        // filtramos el resultado por si el modelo nos la intenta liar
        const sentiment = data.response.trim().toLowerCase();
        if (sentiment.includes('positive')) return 'positive';
        if (sentiment.includes('negative')) return 'negative';
        if (sentiment.includes('neutral')) return 'neutral';
        
        return sentiment;
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

        // Agafem només els dos primers jocs
        const firstTwoGames = games.slice(0, 2);
        
        // Creem l'estructura de resultats
        const results = {
            timestamp: new Date().toISOString(),
            games: []
        };

        console.log('\n=== Anàlisi de Sentiment de Reviews ===');
        
        // Iterem pels dos primers jocs
        for (const game of firstTwoGames) {
            console.log(`\n=== Processant joc: ${game.name} (${game.appid}) ===`);
            
            // Filtrar les reviews per agafar nomès les del joc
            const gameReviews = [];
            for (let i = 0; i < reviews.length; i++) {
                if (reviews[i].app_id === game.appid) {
                    gameReviews.push(reviews[i]);
                }
            }
            
            // agafar nomès les primeres dues
            const reviewsToAnalyze = gameReviews.slice(0, 2);
            
            const statistics = {
                positive: 0,
                negative: 0,
                neutral: 0,
                error: 0
            };
            
            // per cada review analitzem el sentiment
            for (const review of reviewsToAnalyze) {
                console.log(`\nProcessant review: ${review.id}`);
                console.log(`Contingut: ${review.content.substring(0, 100)}...`);
                
                const sentiment = await analyzeSentiment(review.content);
                console.log(`Sentiment (Ollama): ${sentiment}`);
                
                // Actualitzem les estadístiques
                if (sentiment === 'positive') {
                    statistics.positive++;
                } else if (sentiment === 'negative') {
                    statistics.negative++;
                } else if (sentiment === 'neutral') {
                    statistics.neutral++;
                } else {
                    statistics.error++;
                }
                
                console.log('------------------------');
            }
            
            // Afegim el joc als resultats
            results.games.push({
                appid: game.appid,
                name: game.name,
                statistics: statistics
            });
            
            console.log(`\nEstadístiques per ${game.name}:`);
            console.log(JSON.stringify(statistics, null, 2));
        }
        
        // Guardem els resultats al json
        const outputPath = path.join(__dirname, dataPath, 'exercici2_resposta.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
        
        console.log(`\nResultats guardats a: ${outputPath}`);
        console.log('\n=== Resum Final ===');
        console.log(JSON.stringify(results, null, 2));
     } catch (error) {
        console.error('Error durant l\'execució:', error.message);
    }
}

// Executem la funció principal
main();
