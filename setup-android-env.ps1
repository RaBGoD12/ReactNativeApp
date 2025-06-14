# Script para configurar Android SDK en PowerShell
# Ejecutar como: .\setup-android-env.ps1

Write-Host "Configurando variables de entorno para Android SDK..." -ForegroundColor Green

$androidSdkPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

if (Test-Path $androidSdkPath) {
    # Configurar variables de entorno para la sesión actual
    $env:ANDROID_HOME = $androidSdkPath
    $env:ANDROID_SDK_ROOT = $androidSdkPath
    
    # Agregar herramientas de Android al PATH
    $env:PATH += ";$androidSdkPath\emulator"
    $env:PATH += ";$androidSdkPath\platform-tools"
    $env:PATH += ";$androidSdkPath\cmdline-tools\latest\bin"
    
    Write-Host "✅ Variables de entorno configuradas:" -ForegroundColor Green
    Write-Host "   ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Cyan
    Write-Host "   ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ahora puedes usar:" -ForegroundColor Yellow
    Write-Host "   emulator -list-avds" -ForegroundColor White
    Write-Host "   emulator -avd NOMBRE_EMULADOR" -ForegroundColor White
    Write-Host "   adb devices" -ForegroundColor White
    Write-Host ""
    
    # Verificar que adb funciona
    try {
        & adb version | Out-Null
        Write-Host "✅ ADB está funcionando correctamente" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  ADB no está disponible" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ No se encontró Android SDK en: $androidSdkPath" -ForegroundColor Red
    Write-Host "Por favor, instala Android Studio primero." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Para hacer estos cambios permanentes, agrégalos a tu perfil de PowerShell." -ForegroundColor Yellow
