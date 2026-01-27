#!/bin/bash

# Function to clean a project directory
clean_project() {
    local project_dir=$1
    echo "Netejant $project_dir..."
    
    cd "$project_dir" || exit

    # Eliminar node_modules
    if [ -d "node_modules" ]; then
        echo "Eliminant node_modules..."
        rm -rf node_modules
    fi

    # Eliminar directori de coverage
    if [ -d "coverage" ]; then
        echo "Eliminant directori de coverage..."
        rm -rf coverage
    fi

    # Netejar caché de npm
    npm cache clean --force

    cd - > /dev/null
}

# Comprovar si estem a la carpeta correcta
if [ ! -d "xat-api" ]; then
    echo "Error: Executa l'script des del directori pare de xat-api"
    exit 1
fi

# Netejar projectes
clean_project "xat-api"
clean_project "xat-cli"
clean_project "xat-web"
clean_project "practica-codi"

echo "Neteja completada."