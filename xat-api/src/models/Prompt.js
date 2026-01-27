const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Conversation = require('./Conversation');

const Prompt = sequelize.define('Prompt', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    prompt: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    model: {
        type: DataTypes.STRING,
        defaultValue: process.env.CHAT_API_OLLAMA_MODEL,
        allowNull: false
    },
    stream: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    response: {
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

module.exports = Prompt;
