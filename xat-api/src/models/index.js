const Conversation = require('./Conversation');
const Prompt = require('./Prompt');
const SentimentAnalysis = require('./SentimentAnalysis');

// Definim les relacions aquí, un cop tots els models estan carregats
Conversation.hasMany(Prompt, { foreignKey: 'ConversationId', onDelete: 'CASCADE' });
Prompt.belongsTo(Conversation, { foreignKey: 'ConversationId' });

module.exports = {
    Conversation,
    Prompt,
    SentimentAnalysis
};
