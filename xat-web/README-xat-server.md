# xat-server

Servidor web que proporciona una interfície d'usuari per a xatejar amb models d'Ollama.

## Prerequisits

- Node.js v20 o superior

## Instal·lació

1. Instal·la les dependències:

```bash
npm install
```

## Configuració
1. Revisa la url del fitxer ./public/js/main.js per tal que apunti a l'adreça en la que s'executa Xat-API
const API_ENDPOINT = `http://127.0.0.1:3000/api`;

2. Configura les variables en el fitxer `.env`:
```env
# Port on s'executarà el servidor web
XAT_WEB_PORT=...
```

## Executar l'Aplicació

1. Inicia l'aplicació en mode desenvolupament:

```bash
npm run dev
```

2. O en mode producció:

```bash
npm start
```

El servidor web estarà disponible a `http://127.0.0.1:3001`.

## Estructura de Fitxers

```
xat-server/
├── public/
│   ├── css/           # Estils CSS
│   ├── js/           # Codi JavaScript del client
│   └── index.html    # Pàgina principal
├── src/
│   └── server.js     # Servidor Express
├── package.json      # Dependències i scripts
└── README.md         # Aquesta documentació
```

## Funcionalitats

- Interfície web per xatejar amb models d'Ollama
- Suport per múltiples models
- Mode streaming per respostes en temps real
- Gestió de converses
- Disseny responsive
