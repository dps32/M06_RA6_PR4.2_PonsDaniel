import dotenv from 'dotenv';
dotenv.config();

const CHAT_API_OLLAMA_MODEL = process.env.CHAT_API_OLLAMA_MODEL;

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { getModels, sendPrompt } from './utils/api.js';
import { displayMessage } from './utils/display.js';

const program = new Command();

// Variable global per mantenir l'ID de la conversa
let conversationId = null;

// Funció principal per iniciar el xat
async function startChat() {
    console.log(chalk.blue('=== Client de Xat ===\n'));
    
    try {
        // Carregar models disponibles
        const spinner = ora('Carregant models disponibles...').start();
        const models = await getModels();
        spinner.succeed('Models carregats correctament');

        // Preguntar quin model utilitzar
        const { model } = await inquirer.prompt([{
            type: 'rawlist',
            name: 'model',
            message: 'Selecciona el model a utilitzar (introdueix el número):',
            choices: models.map(m => m.name),
            default: models.findIndex(m => m.name === CHAT_API_OLLAMA_MODEL) || 0,
            pageSize: 50
        }]);

        // Preguntar si es vol utilitzar streaming
        const { useStream } = await inquirer.prompt([{
            type: 'confirm',
            name: 'useStream',
            message: 'Vols utilitzar streaming per les respostes?',
            default: false
        }]);

        console.log(chalk.green('\nXat iniciat! Escriu "exit" per sortir o "new" per iniciar una nova conversa.\n'));

        // Bucle principal del xat
        while (true) {
            const { prompt } = await inquirer.prompt([{
                type: 'input',
                name: 'prompt',
                message: chalk.yellow('Tu >'),
                validate: input => input.trim() ? true : 'Si us plau, escriu un missatge'
            }]);

            const trimmedPrompt = prompt.trim();

            // Comandes especials
            if (trimmedPrompt.toLowerCase() === 'exit') {
                console.log(chalk.blue('\nFinalitzant xat...'));
                break;
            }

            if (trimmedPrompt.toLowerCase() === 'new') {
                console.log(chalk.green('\nInicial nova conversa...\n'));
                conversationId = null;
                continue;
            }

            // Enviar prompt
            try {
                const spinner = ora('Processant...').start();
                
                const response = await sendPrompt({
                    conversationId,
                    prompt: trimmedPrompt,
                    model,
                    stream: useStream
                });

                if (!conversationId && response.conversationId) {
                    conversationId = response.conversationId;
                }

                spinner.stop();
                
                if (useStream) {
                    process.stdout.write(chalk.cyan('Assistant > '));
                    for await (const chunk of response) {
                        process.stdout.write(chunk);
                    }
                    console.log('\n');
                } else {
                    displayMessage(response.response, false);
                }

            } catch (error) {
                console.error(chalk.red('Error processant el missatge:', error.message));
            }
        }

    } catch (error) {
        console.error(chalk.red('Error iniciant el xat:', error.message));
        process.exit(1);
    }
}

// Configurar comandes
program
    .name('xat')
    .description('Client de línia de comandes per al xat')
    .version('1.0.0')
    .action(startChat);

program.parse();
