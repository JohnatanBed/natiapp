Write-Host "Configurando IP automáticamente para la conexión backend..." -ForegroundColor Cyan

# Función para obtener la dirección IP del equipo
function Get-LocalIPAddress {
    # Obtiene la interfaz de red activa que tiene acceso a internet (IPv4)
    $networkInterfaces = Get-NetIPAddress -AddressFamily IPv4 | 
                        Where-Object { 
                            $_.IPAddress -notmatch "^169\.254\." -and 
                            $_.IPAddress -ne "127.0.0.1" -and
                            $_.PrefixOrigin -ne "WellKnown"
                        }

    if ($networkInterfaces.Count -eq 0) {
        return $null
    }
    
    # Tomar la primera interfaz (la más probable para conectar dispositivos)
    return $networkInterfaces[0].IPAddress
}

# Función para actualizar el archivo ApiService.ts con la IP local
function Update-ApiServiceIP {
    param (
        [string]$FilePath,
        [string]$IP,
        [string]$Port = "5000"
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "No se encontró el archivo ApiService.ts en la ruta especificada." -ForegroundColor Red
        return $false
    }
    
    $content = Get-Content $FilePath -Raw
    
    # Patrón para buscar la definición de la URL base
    $pattern = "(private\s+baseURL:\s*string\s*=\s*['\"]).+(['\"];)"
    
    # Reemplazar con la nueva URL base
    $replacement = "`$1http://$IP`:$Port/api`$2"
    
    # Actualizar el contenido
    $newContent = $content -replace $pattern, $replacement
    
    if ($content -eq $newContent) {
        Write-Host "No se pudo encontrar el patrón adecuado para reemplazar la URL." -ForegroundColor Yellow
        return $false
    }
    
    # Escribir el contenido actualizado de vuelta al archivo
    Set-Content -Path $FilePath -Value $newContent
    
    return $true
}

# Obtener la IP local
$localIP = Get-LocalIPAddress

if ($null -eq $localIP) {
    Write-Host "No se pudo determinar la dirección IP local del equipo." -ForegroundColor Red
    exit 1
}

Write-Host "IP local detectada: $localIP" -ForegroundColor Green

# Ruta del archivo ApiService.ts
$apiServicePath = Join-Path $PSScriptRoot "frontend\services\ApiService.ts"

# Guardar el contenido original antes de modificar
$originalContent = Get-Content $apiServicePath -Raw

# Preguntar al usuario qué configuración desea
Write-Host "`n¿Para qué entorno deseas configurar la conexión?" -ForegroundColor Yellow
Write-Host "1. Emulador Android (10.0.2.2)" -ForegroundColor White
Write-Host "2. Dispositivo físico en la misma red ($localIP)" -ForegroundColor White
Write-Host "3. Desarrollo web (localhost)" -ForegroundColor White

$choice = Read-Host "Selecciona una opción (1-3)"

switch ($choice) {
    "1" {
        $updateResult = Update-ApiServiceIP -FilePath $apiServicePath -IP "10.0.2.2"
        $targetIP = "10.0.2.2"
    }
    "2" {
        $updateResult = Update-ApiServiceIP -FilePath $apiServicePath -IP $localIP
        $targetIP = $localIP
    }
    "3" {
        $updateResult = Update-ApiServiceIP -FilePath $apiServicePath -IP "localhost"
        $targetIP = "localhost"
    }
    default {
        Write-Host "Opción no válida. Saliendo sin cambios." -ForegroundColor Red
        exit 1
    }
}

if ($updateResult) {
    Write-Host "`n✅ ApiService.ts actualizado correctamente con la IP: $targetIP" -ForegroundColor Green
    
    # Mostrar los cambios realizados
    $newContent = Get-Content $apiServicePath -Raw
    if ($originalContent -ne $newContent) {
        Write-Host "`nCambios realizados:" -ForegroundColor Cyan
        
        # Extraer la URL antes y después
        $originalContent -match "(private\s+baseURL:\s*string\s*=\s*['\"])(.+)(['\"];)" | Out-Null
        $oldUrl = $matches[2]
        
        $newContent -match "(private\s+baseURL:\s*string\s*=\s*['\"])(.+)(['\"];)" | Out-Null
        $newUrl = $matches[2]
        
        Write-Host "  Antes: $oldUrl" -ForegroundColor Gray
        Write-Host "  Después: $newUrl" -ForegroundColor White
    }
    
    Write-Host "`nRecuerda:" -ForegroundColor Cyan
    if ($targetIP -eq "10.0.2.2") {
        Write-Host "- Esta configuración funciona solo para emuladores Android." -ForegroundColor White
        Write-Host "- Asegúrate de que el servidor backend esté ejecutándose en tu máquina." -ForegroundColor White
    }
    elseif ($targetIP -eq "localhost") {
        Write-Host "- Esta configuración funciona solo para desarrollo web en el mismo equipo." -ForegroundColor White
        Write-Host "- No funcionará en emuladores ni dispositivos físicos." -ForegroundColor White
    }
    else {
        Write-Host "- Esta configuración funciona para dispositivos físicos conectados a la misma red." -ForegroundColor White
        Write-Host "- El dispositivo debe estar conectado a la misma red Wi-Fi que tu computadora." -ForegroundColor White
        Write-Host "- Asegúrate de que el servidor backend esté ejecutándose y no esté bloqueado por el firewall." -ForegroundColor White
    }
    
    Write-Host "`nPuedes probar la conexión ejecutando:" -ForegroundColor Yellow
    Write-Host ".\check_backend_connection.ps1" -ForegroundColor White
}
else {
    Write-Host "No se pudo actualizar ApiService.ts. Verifica la estructura del archivo." -ForegroundColor Red
}
