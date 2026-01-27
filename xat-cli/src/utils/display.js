import chalk from 'chalk';

/**
 * Mostra un missatge al xat
 */
export function displayMessage(message, isUser = true) {
    const prefix = isUser ? chalk.yellow('Tu > ') : chalk.cyan('Assistant > ');
    console.log(prefix + message + '\n');
}
