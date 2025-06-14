#!/usr/bin/env pwsh
# Script para iniciar la aplicación completa

Write-Host "🚀 Iniciando AppCables..." -ForegroundColor Green

# Verificar dependencias
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Configurar entorno Android
Write-Host "🔧 Configurando entorno Android..." -ForegroundColor Yellow
.\setup-android-env.ps1

# Verificar emulador
Write-Host "📱 Verificando emulador Android..." -ForegroundColor Yellow
$devices = adb devices | Select-String "device" | Measure-Object
if ($devices.Count -lt 2) {
    Write-Host "⚠️  No se detectó ningún emulador ejecutándose" -ForegroundColor Red
    Write-Host "Por favor, inicia un emulador Android primero." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Emuladores disponibles:" -ForegroundColor Cyan
    emulator -list-avds
    Write-Host ""
    Write-Host "Para iniciar un emulador, ejecuta:" -ForegroundColor White
    Write-Host "emulator -avd NOMBRE_EMULADOR" -ForegroundColor White
    exit 1
}

Write-Host "✅ Emulador detectado" -ForegroundColor Green

# Verificar configuración de Supabase
$envFile = ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "ejemplo.supabase.co" -or $envContent -match "tu_clave_anonima_aqui") {
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE: Configura Supabase" -ForegroundColor Yellow
        Write-Host "Edita el archivo .env con tus credenciales reales de Supabase" -ForegroundColor White
        Write-Host "Ver CONFIGURACION.md para instrucciones detalladas" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "Copiando .env.example a .env..." -ForegroundColor White
    Copy-Item ".env.example" ".env"
}

# Iniciar aplicación
Write-Host "🚀 Iniciando aplicación en el emulador..." -ForegroundColor Green
npm run android
