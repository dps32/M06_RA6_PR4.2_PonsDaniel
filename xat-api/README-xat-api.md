# xat-api

API per gestionar converses amb models d'Ollama.

## Prerequisits

- Node.js v20 o superior
- Base de dades MySQL (pot ser local o en Docker)
- Una instància d'Ollama amb models instal·lats

## Instal·lació i Configuració

1. Instal·la les dependències:

```bash
npm install
```

2. Configura les variables en el fitxer fitxers `.env` i `.env.test`:

## Executar l'Aplicació

1. Inicia l'aplicació en mode desenvolupament:

```bash
npm run dev
```

2. O en mode producció:

```bash
npm start
```

L'API estarà disponible a `http://localhost:3000` i la documentació Swagger a `http://localhost:3000/api-docs`.

## Verificació de Funcionament

### Verificació automàtica amb tests
```bash
npm test
```

O bé, mentre estem en desenvolupament, execució contínua

```bash
npm run test:watch
```


### Verificació manual

Pots verificar que l'API funciona correctament amb les següents comandes curl:

1. Llistar models disponibles:

```bash
curl http://localhost:3000/api/chat/models
```

2. Crear una nova conversa amb un prompt:

```bash
curl -X POST http://localhost:3000/api/chat/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hola, com estàs?",
    "model": "qwen2.5vl:7b"
  }'
```

3. Obtenir una conversa existent (substitueix UUID):

```bash
curl http://localhost:3000/api/chat/conversation/UUID-DE-LA-CONVERSA
```

4. Afegir un prompt a una conversa existent:

```bash
curl -X POST http://localhost:3000/api/chat/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "UUID-DE-LA-CONVERSA",
    "prompt": "Segona pregunta",
    "model": "qwen2.5vl:7b"
  }'
```

5. Provar streaming (requereix un client que suporti SSE):

```bash
curl -X POST http://localhost:3000/api/chat/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explica'm un conte llarg",
    "model": "qwen2.5vl:7b",
    "stream": true
  }'
```

## Estructura de Fitxers

Els principals fitxers i directoris són:

```
xat-api/
├── src/
│   ├── config/           # Configuració de la base de dades i Swagger
│   ├── controllers/      # Controladors de l'API
│   ├── middleware/       # Middleware personalitzat
│   ├── models/          # Models de Sequelize
│   └── routes/          # Definició de rutes
├── tests/               # Tests unitaris i d'integració
├── .env                 # Variables d'entorn
├── package.json         # Dependències i scripts
└── server.js           # Punt d'entrada de l'aplicació
```

## Gestió d'Errors

L'API inclou gestió d'errors per:
- Errors de validació d'UUID
- Errors de connexió amb Ollama
- Errors de base de dades
- Errors en el streaming

Els errors retornen respostes JSON amb codis d'estat HTTP apropiats i missatges descriptius.
