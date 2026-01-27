const { logger } = require('../config/logger');

/**
 * Middleware per gestionar errors de forma centralitzada
 * Captura tots els errors de l'aplicació i proporciona una resposta adequada
 */
const errorHandler = (err, req, res, next) => {
    // Registrem l'error complet amb stack trace per debugging
    logger.error('Error detectat:', { 
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    
    // Gestió d'errors de validació de Sequelize (per exemple, camps obligatoris)
    if (err.name === 'SequelizeValidationError') {
        logger.warn('Error de validació de dades:', {
            errors: err.errors.map(e => e.message)
        });
        return res.status(400).json({
            message: 'Error de validació',
            errors: err.errors.map(e => e.message)
        });
    }
    
    // Gestió d'errors de clau única de Sequelize (per exemple, duplicats)
    if (err.name === 'SequelizeUniqueConstraintError') {
        logger.warn('Intent de duplicar registre únic:', {
            errors: err.errors.map(e => e.message)
        });
        return res.status(400).json({
            message: 'Error de duplicació',
            errors: err.errors.map(e => e.message)
        });
    }

    // Per altres tipus d'errors, retornem un error 500
    // En desenvolupament mostrem el missatge d'error, en producció no
    const isDevMode = process.env.NODE_ENV === 'development';
    logger.error('Error no controlat:', {
        isDev: isDevMode,
        errorName: err.name,
        errorMessage: err.message
    });

    res.status(500).json({
        message: 'Hi ha hagut un error!',
        error: isDevMode ? err.message : {}
    });
};

module.exports = errorHandler;