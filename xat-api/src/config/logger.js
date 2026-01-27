// src/config/logger.js
const winston = require('winston');
const { format } = winston;  // Afegim l'import del format
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Format comú per tots els transports
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack, ...metadata }) => {
        let log = `${timestamp} ${level}: ${message}`;
        
        // Afegir metadata si existeix
        if (Object.keys(metadata).length > 0) {
            log += ` ${JSON.stringify(metadata)}`;
        }
        
        // Afegir stack trace si existeix
        if (stack) {
            log += `\n${stack}`;
        }
        
        return log;
    })
);

// Configuració base del logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Transport per consola (sempre actiu)
        new winston.transports.Console({
            format: format.combine(
                format.colorize(),
                logFormat
            )
        })
    ]
});

// Configurar transport per fitxer si s'especifica la ruta
if (process.env.LOG_FILE_PATH) {
    // Crear el directori de logs si no existeix
    const logDir = process.env.LOG_FILE_PATH;
    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
            console.log(`Directori de logs creat: ${logDir}`);
        }

        const fileTransport = new winston.transports.DailyRotateFile({
            filename: path.join(logDir, '%DATE%-app.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
            format: logFormat
        });

        fileTransport.on('rotate', (oldFilename, newFilename) => {
            logger.info('Rotating log files', { oldFilename, newFilename });
        });

        logger.add(fileTransport);
    } catch (error) {
        console.error('Error al crear el directori de logs:', error);
    }
}

// Middleware per Express
const expressLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });
    next();
};

module.exports = { logger, expressLogger };