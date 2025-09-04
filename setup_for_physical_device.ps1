Write-Host "Configurando NatiApp para dispositivo físico..." -ForegroundColor Cyan
Write-Host ""

# Función para encontrar la mejor IP para usar con dispositivos físicos
function Get-BestLocalIP {
    # Obtener todas las direcciones IPv4 que no sean de loopback o APIPA
    $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -notmatch "^127\." -and 
        $_.IPAddress -notmatch "^169\.254\." 
    } | ForEach-Object { $_.IPAddress }
    
    # Preferimos direcciones en los rangos de red local típicos
    $preferredRanges = @("192.168.", "10.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.")
    
    foreach ($range in $preferredRanges) {
        foreach ($ip in $ips) {
            if ($ip.StartsWith($range)) {
                return $ip
            }
        }
    }
    
    # Si no encontramos una IP preferida, devolver la primera disponible
    if ($ips.Count -gt 0) {
        return $ips[0]
    }
    
    # Si no hay IPs disponibles, devolver localhost
    return "localhost"
}

# Obtener la mejor IP para usar
$bestIP = Get-BestLocalIP
Write-Host "IP local detectada: $bestIP" -ForegroundColor Green

# Ruta al archivo ApiService.ts
$apiServicePath = Join-Path $PSScriptRoot "frontend\services\ApiService.ts"

# Verificar si el archivo existe
if (-not (Test-Path $apiServicePath)) {
    Write-Host "Error: No se encontró el archivo ApiService.ts en $apiServicePath" -ForegroundColor Red
    exit 1
}

# Leer el contenido actual
$content = Get-Content $apiServicePath -Raw

# Verificar si ya está configurado con esta IP
if ($content -match "private baseURL: string = 'http://$bestIP`:5000/api'") {
    Write-Host "La API ya está configurada para usar $bestIP" -ForegroundColor Green
    Write-Host "No se necesitan cambios."
} else {
    # Actualizar la URL base
    $newContent = $content -replace "(private baseURL: string = ')http://[^:]+:5000/api'", "`$1http://$bestIP`:5000/api'"
    
    # Actualizar el comentario
    $newContent = $newContent -replace "// Configurado para .+", "// Configurado para dispositivo físico ($bestIP)"
    
    # Guardar los cambios
    $newContent | Set-Content $apiServicePath -Force
    
    Write-Host "ApiService.ts actualizado exitosamente para usar $bestIP" -ForegroundColor Green
}

# Verificar si el servidor backend está configurado para escuchar en todas las interfaces
$indexJsPath = Join-Path $PSScriptRoot "backend\src\index.js"

if (Test-Path $indexJsPath) {
    $indexContent = Get-Content $indexJsPath -Raw
    
    if ($indexContent -match "app.listen\(PORT, '0\.0\.0\.0'") {
        Write-Host "El servidor backend ya está configurado para escuchar en todas las interfaces" -ForegroundColor Green
    } else {
        Write-Host "`nPara que el dispositivo físico pueda conectarse, asegúrate de que el servidor" -ForegroundColor Yellow
        Write-Host "backend esté configurado para escuchar en todas las interfaces (0.0.0.0)" -ForegroundColor Yellow
        Write-Host "Ya se ha actualizado el archivo index.js con esta configuración." -ForegroundColor Yellow
    }
}

Write-Host "`nPasos para conectar desde un dispositivo físico:" -ForegroundColor Cyan
Write-Host "1. Asegúrate de que tu dispositivo esté conectado a la misma red Wi-Fi" -ForegroundColor White
Write-Host "2. Inicia el servidor backend con: cd backend; node src/index.js" -ForegroundColor White
Write-Host "3. Ejecuta la aplicación en el dispositivo físico" -ForegroundColor White
Write-Host "`nImportante: Asegúrate de que no hay firewalls bloqueando el puerto 5000" -ForegroundColor Yellow
