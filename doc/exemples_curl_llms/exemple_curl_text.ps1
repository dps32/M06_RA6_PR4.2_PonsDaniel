try {
    # Crear el JSON amb el prompt i stream false
    $jsonBody = @{
        model = "qwen2.5vl:7b"
        prompt = "Analitza el sentiment d'aquest text (positiu, negatiu o neutral): 'M'encanta la nova pel·lícula, és fantàstica!'"
        stream = $false
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
    Write-Error "Error en processar la petició: $_"
}