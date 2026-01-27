#!/bin/bash

# Crear el JSON amb el prompt i stream false
JSON_BODY=$(cat << EOF
{
   "model": "qwen2.5vl:7b",
   "prompt": "Analitza el sentiment d'aquest text (positiu, negatiu o neutral): 'M'encanta la nova pel·lícula, és fantàstica!'",
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