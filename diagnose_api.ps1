# Diagnóstico de conexión API

$ErrorActionPreference = "Continue"
Write-Host "DIAGNÓSTICO DE CONEXIÓN API NATIAPP" -ForegroundColor Cyan
Write-Host "----------------------------------" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si el servidor está en ejecución
Write-Host "1. Verificando si el servidor backend está en ejecución..." -ForegroundColor Yellow
$serverRunning = $false

try {
    $process = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*src/index.js*" }
    if ($process) {
        Write-Host "   ✓ El servidor backend está en ejecución (PID: $($process.Id))" -ForegroundColor Green
        $serverRunning = $true
    } else {
        Write-Host "   ✗ El servidor backend no parece estar en ejecución" -ForegroundColor Red
        Write-Host "     Debes iniciar el servidor con: cd backend; node src/index.js" -ForegroundColor White
    }
} catch {
    Write-Host "   ✗ Error al comprobar si el servidor está en ejecución" -ForegroundColor Red
}

# 2. Verificar configuración de API en el frontend
Write-Host ""
Write-Host "2. Verificando configuración de API en el frontend..." -ForegroundColor Yellow
$apiConfig = $null

try {
    $apiServicePath = Join-Path $PSScriptRoot "frontend\services\ApiService.ts"
    if (Test-Path $apiServicePath) {
        $content = Get-Content $apiServicePath -Raw
        if ($content -match "baseURL: string = '([^']+)'") {
            $baseUrl = $matches[1]
            $apiConfig = $baseUrl
            Write-Host "   ✓ URL base configurada en ApiService.ts: $baseUrl" -ForegroundColor Green
            
            # Verificar si la configuración es adecuada
            if ($baseUrl -match "localhost") {
                Write-Host "     ⚠ ADVERTENCIA: Usar 'localhost' funcionará solo en desarrollo web" -ForegroundColor Yellow
                Write-Host "       • Para emuladores Android: usa 'http://10.0.2.2:5000/api'" -ForegroundColor White
            }
            elseif ($baseUrl -match "10.0.2.2") {
                Write-Host "     ✓ Configuración correcta para emuladores Android" -ForegroundColor Green
            }
            elseif ($baseUrl -match "192.168.|172.|10.") {
                Write-Host "     ✓ Configuración con IP local (adecuada para dispositivos físicos)" -ForegroundColor Green
                
                # Verificar si la IP configurada existe en esta máquina
                $ipMatches = $baseUrl -match "http://([0-9.]+):"
                if ($ipMatches) {
                    $configuredIp = $matches[1]
                    $localIps = @()
                    try {
                        $adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
                            $_.IPAddress -notmatch "^169\.254\." -and 
                            $_.IPAddress -ne "127.0.0.1"
                        }
                        $localIps = $adapters | ForEach-Object { $_.IPAddress }
                        
                        if ($localIps -contains $configuredIp) {
                            Write-Host "     ✓ La IP configurada ($configuredIp) existe en esta máquina" -ForegroundColor Green
                        } else {
                            Write-Host "     ⚠ ADVERTENCIA: La IP configurada ($configuredIp) NO existe en esta máquina" -ForegroundColor Yellow
                            Write-Host "       • IPs disponibles: $($localIps -join ', ')" -ForegroundColor White
                        }
                    } catch {
                        Write-Host "     ⚠ No se pudieron verificar las IPs locales" -ForegroundColor Yellow
                    }
                }
            }
            else {
                Write-Host "     ⚠ URL base no reconocida, verifica que sea correcta" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ✗ No se pudo encontrar la configuración de URL base en ApiService.ts" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✗ No se encontró el archivo ApiService.ts" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Error al verificar la configuración de API: $_" -ForegroundColor Red
}

# 3. Intentar probar la conexión al backend
Write-Host ""
Write-Host "3. Probando conexión con el backend..." -ForegroundColor Yellow

$urls = @(
    "http://localhost:5000",
    "http://10.0.2.2:5000",
    "http://localhost:5000/api/auth/login",
    "http://10.0.2.2:5000/api/auth/login"
)

if ($apiConfig) {
    $baseApiUrl = $apiConfig -replace "/api$", ""
    $urls += $baseApiUrl
    $urls += "$baseApiUrl/api/auth/login"
}

foreach ($url in $urls) {
    Write-Host "   • Probando $url..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        Write-Host " ✓ Conexión exitosa (Status: $($response.StatusCode))" -ForegroundColor Green
        
        $contentPreview = $response.Content
        if ($contentPreview.Length -gt 100) {
            $contentPreview = $contentPreview.Substring(0, 97) + "..."
        }
        Write-Host "     Respuesta: $contentPreview" -ForegroundColor Gray
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            # Si recibimos un código de estado, al menos el servidor está respondiendo
            Write-Host " ⚠ El servidor respondió con código $statusCode" -ForegroundColor Yellow
            
            if ($statusCode -eq 404) {
                Write-Host "     La ruta no existe (404 Not Found)" -ForegroundColor White
            }
            elseif ($statusCode -eq 405) {
                Write-Host "     Esta ruta no acepta método GET (405 Method Not Allowed)" -ForegroundColor Green
                Write-Host "     ✓ Esto es ESPERADO para rutas POST como /api/auth/login" -ForegroundColor Green
            }
        } else {
            Write-Host " ✗ No se pudo conectar: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 4. Diagnóstico y soluciones
Write-Host ""
Write-Host "4. Diagnóstico y soluciones recomendadas:" -ForegroundColor Yellow

if (-not $serverRunning) {
    Write-Host "   ❗ PROBLEMA: El servidor backend no está en ejecución" -ForegroundColor Red
    Write-Host "     SOLUCIÓN: Inicia el servidor con el siguiente comando:" -ForegroundColor White
    Write-Host "               cd backend; node src/index.js" -ForegroundColor Cyan
    Write-Host ""
}

if ($apiConfig -and $apiConfig -match "localhost" -and -not ($apiConfig -match "127.0.0.1")) {
    Write-Host "   ❗ PROBLEMA: Usando 'localhost' en la URL del API (no funciona en emuladores)" -ForegroundColor Red
    Write-Host "     SOLUCIÓN: Edita frontend/services/ApiService.ts y cambia la URL base a:" -ForegroundColor White
    Write-Host "               'http://10.0.2.2:5000/api' para emuladores Android" -ForegroundColor Cyan
    Write-Host "               -o-" -ForegroundColor White
    Write-Host "               Usa el script: .\configure_ip.ps1" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "   Si continúas teniendo problemas:" -ForegroundColor White
Write-Host "   1. Verifica que las rutas en backend/src/routes/authRoutes.js sean correctas" -ForegroundColor White
Write-Host "   2. Comprueba que el método POST está siendo utilizado para login" -ForegroundColor White
Write-Host "   3. Verifica que el cuerpo de la solicitud tenga los campos correctos (phoneNumber y password)" -ForegroundColor White
Write-Host ""
Write-Host "   Para más información, consulta: TROUBLESHOOTING-API.md" -ForegroundColor White
