Write-Host "Prueba de conexión para dispositivos físicos" -ForegroundColor Cyan
Write-Host ""

# Obtener todas las direcciones IP locales
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notmatch "^127\." -and 
    $_.IPAddress -notmatch "^169\.254\." 
} | ForEach-Object { $_.IPAddress }

# Mostrar todas las IPs locales
Write-Host "Direcciones IP disponibles en esta máquina:" -ForegroundColor Yellow
foreach ($ip in $ips) {
    Write-Host "  • $ip"
}

# Verificar si el servidor está en ejecución
$testPorts = @()
foreach ($ip in $ips) {
    $testPorts += @{
        IP = $ip
        Port = 5000
    }
}

$testPorts += @{
    IP = "localhost"
    Port = 5000
}

Write-Host "`nVerificando si el servidor está en ejecución..." -ForegroundColor Yellow
$serverRunning = $false

foreach ($test in $testPorts) {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $result = $tcpClient.BeginConnect($test.IP, $test.Port, $null, $null)
        $success = $result.AsyncWaitHandle.WaitOne(1000, $false)
        
        if ($success) {
            $tcpClient.EndConnect($result)
            Write-Host "  ✓ Servidor detectado en $($test.IP):$($test.Port)" -ForegroundColor Green
            $serverRunning = $true
        } else {
            Write-Host "  ✗ No se detectó servidor en $($test.IP):$($test.Port)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Error al verificar $($test.IP):$($test.Port): $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        if ($tcpClient -ne $null) {
            $tcpClient.Close()
        }
    }
}

if (-not $serverRunning) {
    Write-Host "`n⚠ El servidor backend no parece estar en ejecución." -ForegroundColor Yellow
    Write-Host "  Ejecuta: cd backend; node src/index.js" -ForegroundColor White
}

# Mostrar instrucciones para pruebas manuales desde el dispositivo
Write-Host "`nPara probar la conexión desde el dispositivo físico:" -ForegroundColor Cyan
Write-Host "1. Abre un navegador en tu dispositivo móvil" -ForegroundColor White

foreach ($ip in $ips) {
    Write-Host "2. Intenta navegar a http://$ip`:5000" -ForegroundColor White
    Write-Host "   Deberías ver un mensaje JSON como: { \"message\": \"NatiApp API\", \"version\": \"1.0.0\" }" -ForegroundColor White
}

Write-Host "`nRecordatorio: Asegúrate de que:" -ForegroundColor Yellow
Write-Host "• Tu dispositivo esté conectado a la misma red Wi-Fi" -ForegroundColor White
Write-Host "• No haya firewalls bloqueando el puerto 5000" -ForegroundColor White
Write-Host "• El servidor backend esté configurado para escuchar en todas las interfaces (0.0.0.0)" -ForegroundColor White
