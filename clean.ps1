# Script de neteja per PowerShell

function Clean-Project {
    param (
        [string]$ProjectPath
    )

    Write-Host "Netejant $ProjectPath..." -ForegroundColor Cyan

    # Canviar al directori del projecte
    Push-Location $ProjectPath

    try {
        # Eliminar node_modules
        if (Test-Path -Path "node_modules") {
            Write-Host "Eliminant node_modules..." -ForegroundColor Yellow
            Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        }

        # Eliminar directori de coverage
        if (Test-Path -Path "coverage") {
            Write-Host "Eliminant directori de coverage..." -ForegroundColor Yellow
            Remove-Item -Path "coverage" -Recurse -Force -ErrorAction SilentlyContinue
        }

        # Netejar caché de npm
        Write-Host "Netejant caché de npm..." -ForegroundColor Yellow
        npm cache clean --force
    }
    catch {
        Write-Host "S'ha produït un error en netejar $ProjectPath" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    finally {
        # Tornar al directori original
        Pop-Location
    }
}

# Configurar colors i missatges
$Host.UI.RawUI.ForegroundColor = "White"

# Missatge de benvinguda
Write-Host "=== Script de Neteja de Projectes ===" -ForegroundColor Green

# Comprovar si estem al directori correcte
if (-not (Test-Path -Path "xat-api")) {
    Write-Host "Error: Executa l'script des del directori pare de xat-api" -ForegroundColor Red
    pause
    exit
}

# Netejar projectes
Clean-Project -ProjectPath "xat-api"
Clean-Project -ProjectPath "xat-cli"
Clean-Project -ProjectPath "xat-web"
Clean-Project -ProjectPath "practica-codi"

# Missatge de conclusió
Write-Host "`nNeteja completada." -ForegroundColor Green

# Pausa perquè l'usuari pugui veure els resultats
pause