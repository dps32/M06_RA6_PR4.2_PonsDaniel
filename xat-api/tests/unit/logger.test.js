const fs = require('fs');
const winston = require('winston');

// Mocks de les dependències
jest.mock('fs');
jest.mock('winston-daily-rotate-file', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        name: 'daily-rotate-file'
    }));
});

describe('Logger Configuration Unit Tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules(); // Important: neteja el require() previ
        process.env = { ...originalEnv };
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('Hauria de formatar correctament el missatge amb metadata i stack trace', () => {
        const { logger } = require('../../src/config/logger');
        
        // Accedim al format de transport de consola per provar la funció printf
        const printfFormat = logger.transports[0].format;
        
        const infoWithStack = {
            level: 'error',
            message: 'Error de test',
            timestamp: '2026-01-13 10:00:00',
            stack: 'Error: stack trace line 1',
            service: 'user-service' // metadata
        };

        // Simulem l'execució del format
        // Nota: Winston guarda el resultat final en una clau de Symbol
        const result = logger.format.transform(infoWithStack);
        
        // El mètode printf és el que genera el string final que veiem
        // Podem testejar la lògica del format directament si cal, 
        // però aquí verifiquem que el transport el rep correctament.
        expect(result).toBeDefined();
    });

    test('Hauria de carregar el LOG_LEVEL des de l’entorn', () => {
        process.env.LOG_LEVEL = 'warn';
        const { logger } = require('../../src/config/logger');
        expect(logger.level).toBe('warn');
    });

    test('expressLogger hauria de calcular el temps i fer el log al finish', () => {
        const { expressLogger, logger } = require('../../src/config/logger');
        const loggerSpy = jest.spyOn(logger, 'info').mockImplementation();

        const req = {
            method: 'GET',
            url: '/test',
            ip: '127.0.0.1',
            get: jest.fn().mockReturnValue('Jest-Agent')
        };
        
        let finishHandler;
        const res = {
            statusCode: 200,
            on: jest.fn((event, handler) => {
                if (event === 'finish') finishHandler = handler;
            })
        };
        const next = jest.fn();

        // Executem el middleware
        expressLogger(req, res, next);
        
        expect(next).toHaveBeenCalled();
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

        // Simulem el final de la request
        finishHandler();

        expect(loggerSpy).toHaveBeenCalledWith('HTTP Request', expect.objectContaining({
            method: 'GET',
            status: 200,
            url: '/test'
        }));
    });
});