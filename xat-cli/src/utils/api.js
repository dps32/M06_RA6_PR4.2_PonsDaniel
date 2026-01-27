import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const API_ENDPOINT = process.env.API_ENDPOINT;
console.log(API_ENDPOINT);

/**
 * Obté els models disponibles
 */
export async function getModels() {
    try {
        console.log(`${API_ENDPOINT}/chat/models`);
        const response = await axios.get(`${API_ENDPOINT}/chat/models`);
        return response.data.models;
    } catch (error) {
        throw new Error('No s\'han pogut obtenir els models');
    }
}

/**
 * Envia un prompt al servidor
 */
export async function sendPrompt({ conversationId, prompt, model, stream }) {
    try {
        if (stream) {
            const response = await axios({
                method: 'post',
                url: `${API_ENDPOINT}/chat/prompt`,
                data: {
                    conversationId,
                    prompt,
                    model,
                    stream: true
                },
                responseType: 'stream'
            });

            return response.data;
        } else {
            const response = await axios.post(`${API_ENDPOINT}/chat/prompt`, {
                conversationId,
                prompt,
                model,
                stream: false
            });

            return response.data;
        }
    } catch (error) {
        throw new Error('Error enviant el prompt');
    }
}
