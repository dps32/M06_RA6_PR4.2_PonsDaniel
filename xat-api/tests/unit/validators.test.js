const { validateUUID } = require('../../src/middleware/validators');

describe('Validators Unit Tests', () => {
    test('Hauria de validar un UUID v4 correcte', () => {
        expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    test('Hauria de fallar amb un format incorrecte', () => {
        expect(validateUUID('123-abc')).toBe(false);
        expect(validateUUID(null)).toBe(false);
    });
});