# Verificar que l'arxiu existeix
$imagePath = "..\..\data\exemples\mario_128px.jpg"
if (-not (Test-Path $imagePath)) {
    Write-Error "La imatge no existeix a la ruta especificada"
    return
}

try {
    # Llegir la imatge i convertir-la a base64
    $imageBytes = [IO.File]::ReadAllBytes((Resolve-Path $imagePath))
    $imageBase64 = [Convert]::ToBase64String($imageBytes)

    # Crear el JSON amb només les dades base64 i stream false
    $jsonBody = @{
        model = "qwen2.5vl:7b"
        prompt = "Identifica el que hi ha a la imatge."
        images = @($imageBase64)
        stream = $false  # Afegim el paràmetre stream a false
    } | ConvertTo-Json -Compress

    # Guardar el JSON
    $tempFile = New-TemporaryFile
    $jsonBody | Out-File -FilePath $tempFile.FullName -Encoding utf8NoBOM

    # Fer la petició amb curl
    Write-Host "Enviant petició a Ollama..."
    curl.exe -X POST "http://127.0.0.1:11434/api/generate" `
        -H "Content-Type: application/json" `
        -d "@$($tempFile.FullName)"

    # Netejar
    Remove-Item $tempFile.FullName

} catch {
    Write-Error "Error en processar la imatge: $_"
}
