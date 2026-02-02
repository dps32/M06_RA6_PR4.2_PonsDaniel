// Importacions
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Constants des de variables d'entorn
const IMAGES_SUBFOLDER = 'imatges/animals';
const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif'];
const OLLAMA_URL = process.env.CHAT_API_OLLAMA_URL;
const OLLAMA_MODEL = process.env.CHAT_API_OLLAMA_MODEL_VISION;

// Funció per llegir un fitxer i convertir-lo a Base64
async function imageToBase64(imagePath) {
    try {
        const data = await fs.readFile(imagePath);
        return Buffer.from(data).toString('base64');
    } catch (error) {
        console.error(`Error al llegir o convertir la imatge ${imagePath}:`, error.message);
        return null;
    }
}

// Funció per fer la petició a Ollama amb més detalls d'error
async function queryOllama(base64Image, prompt) {
    const requestBody = {
        model: OLLAMA_MODEL,
        prompt: prompt,
        images: [base64Image],
        stream: false
    };

    try {
        console.log('Enviant petició a Ollama...');
        console.log(`URL: ${OLLAMA_URL}/generate`);
        console.log('Model:', OLLAMA_MODEL);
        
        const response = await fetch(`${OLLAMA_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
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

        return data.response;
    } catch (error) {
        console.error('Error detallat en la petició a Ollama:', error);
        console.error('Detalls adicionals:', {
            url: `${OLLAMA_URL}/generate`,
            model: OLLAMA_MODEL,
            promptLength: prompt.length,
            imageLength: base64Image.length
        });
        return null;
    }
}

// Funció principal
async function main() {
    try {
        // Validem les variables d'entorn necessàries
        if (!process.env.DATA_PATH) {
            throw new Error('La variable d\'entorn DATA_PATH no està definida.');
        }
        if (!OLLAMA_URL) {
            throw new Error('La variable d\'entorn CHAT_API_OLLAMA_URL no està definida.');
        }
        if (!OLLAMA_MODEL) {
            throw new Error('La variable d\'entorn CHAT_API_OLLAMA_MODEL no està definida.');
        }

        const imagesFolderPath = path.join(__dirname, process.env.DATA_PATH, IMAGES_SUBFOLDER);
        try {
            await fs.access(imagesFolderPath);
        } catch (error) {
            throw new Error(`El directori d'imatges no existeix: ${imagesFolderPath}`);
        }


        const analisis = [];

        const animalDirectories = await fs.readdir(imagesFolderPath);

        // Iterem per cada element dins del directori d'animals
        for (const animalDir of animalDirectories) {
            // Construïm la ruta completa al directori de l'animal actual
            const animalDirPath = path.join(imagesFolderPath, animalDir);

            try {
                // Obtenim informació sobre l'element (si és directori, fitxer, etc.)
                const stats = await fs.stat(animalDirPath);
                
                // Si no és un directori, l'ignorem i continuem amb el següent
                if (!stats.isDirectory()) {
                    console.log(`S'ignora l'element no directori: ${animalDirPath}`);
                    continue;
                }
            } catch (error) {
                // Si hi ha error al obtenir la info del directori, el loguegem i continuem
                console.error(`Error al obtenir informació del directori: ${animalDirPath}`, error.message);
                continue;
            }

            // Obtenim la llista de tots els fitxers dins del directori de l'animal
            const imageFiles = await fs.readdir(animalDirPath);

            // Iterem per cada fitxer dins del directori de l'animal
            for (const imageFile of imageFiles) {
                // Construïm la ruta completa al fitxer d'imatge
                const imagePath = path.join(animalDirPath, imageFile);
                // Obtenim l'extensió del fitxer i la convertim a minúscules
                const ext = path.extname(imagePath).toLowerCase();
                
                // Si l'extensió no és d'imatge vàlida (.jpg, .png, etc), l'ignorem
                if (!IMAGE_TYPES.includes(ext)) {
                    console.log(`S'ignora fitxer no vàlid: ${imagePath}`);
                    continue;
                }

                // Convertim la imatge a format Base64 per enviar-la a Ollama
                const base64String = await imageToBase64(imagePath);

                // Si s'ha pogut convertir la imatge correctament
                if (base64String) {
                    // Loguegem informació sobre la imatge que processarem
                    console.log(`\nProcessant imatge: ${imagePath}`);
                    console.log(`Mida de la imatge en Base64: ${base64String.length} caràcters`);
                    
                    // Definim el prompt per a Ollama amb sol·licitud d'anàlisi detallat
                    const prompt = `Analitza l'animal que apareix a la imatge i proporciona la informació en format JSON amb la següent estructura exacta:
                                {
                                    "nom_comu": "nom comú de l'animal",
                                    "nom_cientific": "nom científic si és conegut",
                                    "taxonomia": {
                                        "classe": "mamífer/au/rèptil/amfibi/peix/invertebrat",
                                        "ordre": "ordre taxonòmic",
                                        "familia": "família taxonòmica"
                                    },
                                    "habitat": {
                                        "tipus": ["tipus d'hàbitats on viu"],
                                        "regio_geografica": ["regions geogràfiques on habita"],
                                        "clima": ["tipus de climes preferits"]
                                    },
                                    "dieta": {
                                        "tipus": "carnívor/herbívor/omnívor/insectívor",
                                        "aliments_principals": ["llista d'aliments que consumeix"]
                                    },
                                    "caracteristiques_fisiques": {
                                        "mida": {
                                            "altura_mitjana_cm": "altura o longitud mitjana en cm",
                                            "pes_mitja_kg": "pes mitjà en kg"
                                        },
                                        "colors_predominants": ["colors principals de l'animal"],
                                        "trets_distintius": ["característiques físiques distintives"]
                                    },
                                    "estat_conservacio": {
                                        "classificacio_IUCN": "estat segons la IUCN (LC/NT/VU/EN/CR/EW/EX)",
                                        "amenaces_principals": ["principals amenaces per a l'espècie"]
                                    }
                                }

                                Respon NOMÉS amb el JSON, sense cap text addicional.`;
                    
                                
                    console.log('Enviant petició d\'anàlisi...');
                    
                    // Fem la petició a Ollama amb la imatge i el prompt
                    const response = await queryOllama(base64String, prompt);
                    
                    // Processem la resposta d'Ollama
                    if (response) {
                        try {
                            let jsonText = response.trim();
                            
                            // eliminem el markdown si hi ha
                            if (jsonText.startsWith('```json')) {
                                jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
                            } else if (jsonText.startsWith('```')) {
                                jsonText = jsonText.replace(/```\s*/g, '');
                            }

                            // intentem parjejar-ho
                            const analisi = JSON.parse(jsonText);
                            
                            // Afegim la informació a l'array d'analisis
                            analisis.push({
                                imatge: {
                                    nom_fitxer: imageFile
                                },
                                analisi: analisi
                            });
                            
                            console.log(`Anàlisis completat per ${imageFile}`);
                        } catch (parseError) {
                            console.error(`Error al parsejar JSON per ${imageFile}:`, parseError.message);
                            console.error('Resposta rebuda:', response);
                            
                            // Guardem la resposta en text si no es pot parsejar
                            analisis.push({
                                imatge: {
                                    nom_fitxer: imageFile
                                },
                                analisi: {
                                    error: "No s'ha pogut parsejar la resposta",
                                    resposta_original: response
                                }
                            });
                        }
                    } else {
                        // Si no hem rebut resposta vàlida, loguegem l'error
                        console.error(`\nNo s'ha rebut resposta vàlida per ${imageFile}`);
                        analisis.push({
                            imatge: {
                                nom_fitxer: imageFile
                            },
                            analisi: {
                                error: "No s'ha rebut resposta del model"
                            }
                        });
                    }
                    // Separador per millorar la llegibilitat del output
                    console.log('------------------------');
                }
            }
            console.log(`\nATUREM L'EXECUCIÓ DESPRÉS D'ITERAR EL CONTINGUT DEL PRIMER DIRECTORI`);
            break; // ATUREM L'EXECUCIÓ DESPRÉS D'ITERAR EL CONTINGUT DEL PRIMER DIRECTORI
        }

        // Guardem el resultat al fitxer JSON
        const outputPath = path.join(__dirname, process.env.DATA_PATH, 'exercici3_resposta.json');
        const outputData = {
            analisis: analisis
        };
        
        await fs.writeFile(outputPath, JSON.stringify(outputData, null, 4), 'utf8');
        console.log(`\nResultats guardats a: ${outputPath}`);
        console.log(`Total d'anàlisis realitzades: ${analisis.length}`);

    } catch (error) {
        console.error('Error durant l\'execució:', error.message);
    }
}

// Executem la funció principal
main();