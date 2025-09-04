Write-Host "Verificando ruta específica de API..." -ForegroundColor Cyan
Write-Host ""

# Función para probar una ruta específica con diferentes métodos
function Test-ApiRoute {
    param (
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null
    )
    
    Write-Host "Probando $Method $Url" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($Body -and $Method -ne "GET") {
            $jsonBody = $Body | ConvertTo-Json -Compress
            $params.Add("Body", $jsonBody)
            $params.Add("ContentType", "application/json")
        }
        
        $response = Invoke-WebRequest @params
        
        Write-Host "✓ ÉXITO: Código de estado $($response.StatusCode)" -ForegroundColor Green
        
        $contentPreview = $response.Content
        if ($contentPreview.Length -gt 500) {
            $contentPreview = $contentPreview.Substring(0, 497) + "..."
        }
        Write-Host "Respuesta:" -ForegroundColor Gray
        Write-Host $contentPreview -ForegroundColor Gray
        
        return $true
    }
    catch [System.Net.WebException] {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode) {
            Write-Host "✗ ERROR: Código de estado $statusCode" -ForegroundColor Red
            
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $reader.BaseStream.Position = 0
                $reader.DiscardBufferedData()
                $responseBody = $reader.ReadToEnd()
                
                Write-Host "Respuesta de error:" -ForegroundColor Gray
                Write-Host $responseBody -ForegroundColor Gray
            }
            catch {
                Write-Host "No se pudo leer la respuesta de error" -ForegroundColor Gray
            }
        }
        else {
            Write-Host "✗ ERROR DE CONEXIÓN: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        return $false
    }
    catch {
        Write-Host "✗ ERROR DESCONOCIDO: $($_.Exception)" -ForegroundColor Red
        return $false
    }
}

# URLs para probar
$baseUrls = @(
    "http://localhost:5000",
    "http://10.0.2.2:5000",
    "http://127.0.0.1:5000"
)

$targetPath = "/api/auth/login"
$testData = @{
    phoneNumber = "1234567890"
    password = "test1234"
}

Write-Host "Probando la ruta de login con datos de prueba..." -ForegroundColor Cyan
Write-Host "phoneNumber: $($testData.phoneNumber)" -ForegroundColor Gray
Write-Host "password: $($testData.password)" -ForegroundColor Gray
Write-Host ""

foreach ($baseUrl in $baseUrls) {
    $fullUrl = "$baseUrl$targetPath"
    $result = Test-ApiRoute -Url $fullUrl -Method "POST" -Body $testData
    
    if ($result) {
        Write-Host "✓ La ruta POST $fullUrl funciona correctamente." -ForegroundColor Green
        break
    }
}

Write-Host ""
Write-Host "Instrucciones para solucionar problemas:" -ForegroundColor Cyan
Write-Host "1. Asegúrate de que el servidor backend está ejecutándose" -ForegroundColor White
Write-Host "2. Verifica que la URL en frontend/services/ApiService.ts sea correcta" -ForegroundColor White
Write-Host "3. Si usas un emulador Android, usa 'http://10.0.2.2:5000/api' como baseURL" -ForegroundColor White
Write-Host "4. Para dispositivos físicos, usa la IP de tu computadora en la red local" -ForegroundColor White
