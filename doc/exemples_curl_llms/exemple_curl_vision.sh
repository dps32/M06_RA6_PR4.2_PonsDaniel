#!/bin/bash

# Verificar que l'arxiu existeix
IMAGE_PATH="../../data/exemples/mario_128px.jpg"
if [ ! -f "$IMAGE_PATH" ]; then
    echo "Error: La imatge no existeix a la ruta especificada"
    exit 1
fi

# Llegir la imatge i convertir-la a base64
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_PATH")

# Crear el JSON amb les dades base64 i stream false
JSON_BODY=$(cat << EOF
{
    "model": "qwen2.5vl:7b",
    "prompt": "Identifica el que hi ha a la imatge",
    "images": ["$IMAGE_BASE64"],
    "stream": false
}
EOF
)

# Crear un fitxer temporal
TEMP_FILE=$(mktemp)

# Guardar el JSON al fitxer temporal
echo "$JSON_BODY" > "$TEMP_FILE"

# Fer la petició amb curl
echo "Enviant petició a Ollama..."
curl -X POST "http://127.0.0.1:11434/api/generate" \
    -H "Content-Type: application/json" \
    -d "@$TEMP_FILE"

# Netejar (eliminar el fitxer temporal)
rm "$TEMP_FILE"