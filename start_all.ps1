Write-Host "Starting NatiApp development environment..." -ForegroundColor Cyan
Write-Host ""

# Función para comprobar si NPM está disponible
function Test-NPM {
    try {
        npm -v > $null
        return $true
    } catch {
        return $false
    }
}

# Comprobar si NPM está instalado
if (-not (Test-NPM)) {
    Write-Host "ERROR: NPM no está instalado o no está en el PATH." -ForegroundColor Red
    Write-Host "Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Iniciar el backend en una nueva ventana
Write-Host "Iniciando el servidor backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Esperar 5 segundos para que el backend inicie
Write-Host "Esperando que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar el frontend en una nueva ventana
Write-Host "Iniciando la aplicación React Native..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npx react-native start"

Write-Host ""
Write-Host "Ambos servidores están en ejecución." -ForegroundColor Cyan
Write-Host "Para probar la aplicación, abre otra terminal y ejecuta:" -ForegroundColor White
Write-Host "npx react-native run-android" -ForegroundColor Yellow
Write-Host "o" -ForegroundColor White
Write-Host "npx react-native run-ios" -ForegroundColor Yellow
Write-Host ""
