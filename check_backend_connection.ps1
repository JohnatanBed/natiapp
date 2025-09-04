Write-Host "Verificando conexión con el servidor backend..." -ForegroundColor Cyan

# Función para comprobar si el servidor está respondiendo
function Test-ServerConnection {
    param (
        [string]$Url
    )
    
    try {
        # Realizar una solicitud HTTP al servidor
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 5
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content
        }
    } 
    catch [System.Net.WebException] {
        $ex = $_.Exception
        if ($ex.Response -ne $null) {
            $response = $ex.Response
            $statusCode = [int]$response.StatusCode
            return @{
                Success = $false
                StatusCode = $statusCode
                Error = "El servidor respondió con error: $statusCode"
            }
        } 
        else {
            return @{
                Success = $false
                Error = "No se pudo conectar al servidor. Posiblemente no esté en ejecución."
            }
        }
    }
    catch {
        return @{
            Success = $false
            Error = "Error: $_"
        }
    }
}

# URLs a probar
$urls = @(
    "http://localhost:5000",
    "http://localhost:5000/api/auth"
)

foreach ($url in $urls) {
    Write-Host "`nProbando conexión a: $url" -ForegroundColor Yellow
    $result = Test-ServerConnection -Url $url
    
    if ($result.Success) {
        Write-Host "✓ Conexión exitosa (Status: $($result.StatusCode))" -ForegroundColor Green
        Write-Host "Respuesta: $($result.Content)" -ForegroundColor Gray
    } 
    else {
        Write-Host "✗ Error de conexión" -ForegroundColor Red
        Write-Host $result.Error -ForegroundColor Red
    }
}

Write-Host "`nVerificando configuración de la aplicación..." -ForegroundColor Cyan
$apiServicePath = Join-Path $PSScriptRoot "frontend\services\ApiService.ts"

if (Test-Path $apiServicePath) {
    $content = Get-Content $apiServicePath -Raw
    
    if ($content -match "baseURL: string = '([^']+)'") {
        $baseUrl = $matches[1]
        Write-Host "URL base configurada en ApiService.ts: $baseUrl" -ForegroundColor Yellow
        
        if ($baseUrl -match "localhost") {
            Write-Host "⚠ Advertencia: Usar 'localhost' funcionará solo en desarrollo web, no en emuladores/dispositivos." -ForegroundColor Red
            Write-Host "  - Para emuladores Android: usa 'http://10.0.2.2:5000/api'" -ForegroundColor White
            Write-Host "  - Para dispositivos físicos: usa 'http://TU-IP-LOCAL:5000/api'" -ForegroundColor White
        }
        elseif ($baseUrl -match "10.0.2.2") {
            Write-Host "✓ Configuración correcta para emuladores Android" -ForegroundColor Green
        }
        elseif ($baseUrl -match "192.168.|172.|10.") {
            Write-Host "✓ Configuración con IP local (válida para dispositivos físicos)" -ForegroundColor Green
        }
    }
    else {
        Write-Host "No se pudo determinar la URL base en ApiService.ts" -ForegroundColor Red
    }
}
else {
    Write-Host "No se encontró el archivo ApiService.ts" -ForegroundColor Red
}

Write-Host "`n¿Necesitas ayuda para solucionar problemas?" -ForegroundColor Cyan
Write-Host "1. Asegúrate de que el servidor backend esté en ejecución (ejecuta 'npm start' en la carpeta backend)" -ForegroundColor White
Write-Host "2. Si estás usando un emulador Android, cambia la URL base a 'http://10.0.2.2:5000/api'" -ForegroundColor White
Write-Host "3. Si estás usando un dispositivo físico, cambia la URL base a 'http://TU-IP-LOCAL:5000/api'" -ForegroundColor White
Write-Host "4. Verifica que no haya reglas de firewall bloqueando la conexión" -ForegroundColor White

Write-Host "`nOpciones para probar la conexión desde la aplicación:" -ForegroundColor Cyan
Write-Host "1. Utiliza el componente ApiConnectionTester en tu aplicación" -ForegroundColor White
Write-Host "2. Añade console.log en los métodos de ApiService para depurar" -ForegroundColor White
