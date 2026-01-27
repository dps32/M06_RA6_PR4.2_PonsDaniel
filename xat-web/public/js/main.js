// Constants globals
const API_ENDPOINT = `http://127.0.0.1:3000/api`;
const MAX_PROMPT_LENGTH = 4092;
const MIN_PROMPT_LENGTH = 1;

// Estat de la conversa
let conversationId = null;

/**
 * Actualitza l'ID de la conversa a la UI
 */
function updateConversationId(id) {
    const display = document.getElementById('conversationIdDisplay');
    if (display) {
        display.textContent = id || 'Nova conversa';
    }
    conversationId = id;
}

/**
 * Crea un element de missatge per al xat
 */
function createMessageElement(text, isUser = true, messageId = null) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'response-message');
    messageDiv.textContent = text;

    const messageInfo = document.createElement('div');
    messageInfo.classList.add('message-info');
    
    if (isUser) {
        messageInfo.innerHTML = `
            <span class="status">Enviant...</span>
            ${messageId ? `<span class="id">ID: ${messageId}</span>` : ''}
        `;
    } else {
        messageInfo.innerHTML = messageId ? `ID: ${messageId}` : '';
    }

    messageContainer.appendChild(messageDiv);
    messageContainer.appendChild(messageInfo);
    return messageContainer;
}

/**
 * Afegeix un missatge a l'àrea de xat
 */
function addMessageToChat(text, isUser = true, messageId = null) {
    try {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            throw new Error('Element de missatges no trobat');
        }

        const messageElement = createMessageElement(text, isUser, messageId);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error en afegir missatge:', error);
    }
}

/**
 * Processa la resposta en streaming
 */
async function processStreamResponse(response, messageInfo) {
    const reader = response.body.getReader();
    let responseText = '';
    let responseId = null;
    
    try {
        while (true) {
            const { value, done } = await reader.read();
            
            if (done) break;
            
            // Convertir el chunk a text
            const chunk = new TextDecoder().decode(value);
            // Separar les línies
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.trim() && line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        switch(data.type) {
                            case 'start':
                                responseId = data.promptId;
                                // Crear un nou contenidor per la resposta
                                addMessageToChat('', false, responseId);
                                break;
                            case 'chunk':
                                responseText += data.chunk;
                                // Actualitzar el missatge en temps real
                                const lastMessage = document.querySelector('.message-container:last-child .message');
                                if (lastMessage) {
                                    lastMessage.textContent = responseText;
                                }
                                break;
                            case 'end':
                                // Actualitzar l'estat final
                                if (messageInfo) {
                                    messageInfo.innerHTML = `
                                        <span class="status">Completat</span>
                                        <span class="id">ID: ${data.promptId}</span>
                                    `;
                                }
                                break;
                        }
                    } catch (e) {
                        console.error('Error processant chunk:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error llegint stream:', error);
        throw error;
    }
}

/**
 * Carrega els models disponibles
 */
async function loadModels() {
    try {
        const response = await fetch(`${API_ENDPOINT}/chat/models`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        const modelSelector = document.getElementById('modelSelector');
        
        modelSelector.innerHTML = '';

        data.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = model.name;
            modelSelector.appendChild(option);
        });

        const defaultModel = data.models.find(m => m.name === 'qwen2.5vl:7b') 
            || data.models[0];
        
        if (defaultModel) {
            modelSelector.value = defaultModel.name;
        }

    } catch (error) {
        console.error('Error carregant models:', error);
        addMessageToChat('No s\'han pogut carregar els models disponibles', false);
    }
}

/**
 * Inicia una nova conversa
 */
function startNewConversation() {
    conversationId = null;
    updateConversationId(null);
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.value = '';
    }
    
    addMessageToChat('Nova conversa iniciada', false);
}

/**
 * Envia un prompt al servidor
 */
async function sendPrompt(prompt) {
    if (prompt.length < MIN_PROMPT_LENGTH || prompt.length > MAX_PROMPT_LENGTH) {
        addMessageToChat(
            `El missatge ha de tenir entre ${MIN_PROMPT_LENGTH} i ${MAX_PROMPT_LENGTH} caràcters`, 
            false
        );
        return;
    }

    const lastMessageContainer = document.querySelector('.message-container:last-child');
    const lastMessageInfo = lastMessageContainer?.querySelector('.message-info');

    try {
        const modelSelector = document.getElementById('modelSelector');
        const streamSelector = document.getElementById('streamSelector');
        const useStream = streamSelector.value === 'true';

        const response = await fetch(`${API_ENDPOINT}/chat/prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversationId,
                prompt: prompt.trim(),
                model: modelSelector.value,
                stream: useStream
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        if (useStream) {
            await processStreamResponse(response, lastMessageInfo);
        } else {
            const data = await response.json();
            
            if (data.conversationId) {
                updateConversationId(data.conversationId);
            }

            if (data.promptId && lastMessageInfo) {
                lastMessageInfo.innerHTML = `
                    <span class="status">Enviat</span>
                    <span class="id">ID: ${data.promptId}</span>
                `;
            }

            if (data.response) {
                addMessageToChat(data.response, false, data.promptId);
            }
        }

    } catch (error) {
        console.error('Error en enviar el missatge:', error);
        if (lastMessageInfo) {
            lastMessageInfo.innerHTML = `
                <span class="status error">Error en enviar</span>
            `;
        }
        addMessageToChat('No s\'ha pogut enviar el missatge. Comprova la connexió.', false);
    }
}

/**
 * Inicialitza els event listeners
 */
function initChatEventListeners() {
    const sendButton = document.getElementById('sendButton');
    const promptInput = document.getElementById('promptInput');
    const newConversationBtn = document.getElementById('newConversationBtn');

    if (!sendButton || !promptInput || !newConversationBtn) {
        console.error('No s\'han trobat elements del xat');
        return;
    }

    newConversationBtn.addEventListener('click', () => {
        if (confirm('Vols començar una nova conversa? Es perdrà la conversa actual.')) {
            startNewConversation();
        }
    });

    sendButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        
        if (prompt) {
            sendButton.disabled = true;
            addMessageToChat(prompt, true);
            promptInput.value = '';
            await sendPrompt(prompt);
            sendButton.disabled = false;
        }
    });

    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
}

// Carregar models
// Inicialitzar els listeners
// quan el DOM estigui carregat
document.addEventListener('DOMContentLoaded', () => {
    initChatEventListeners();
    loadModels();
});
