const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SentimentAnalysis = sequelize.define('SentimentAnalysis', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                    msg: 'El text no pot estar buit'
            }
        }
    },
    score: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false
    },
    sentiment: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    model: {
        type: DataTypes.STRING(100),
        defaultValue: process.env.CHAT_API_OLLAMA_MODEL,
        allowNull: false
    },
    resposta_completa: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});


module.exports = SentimentAnalysis;
