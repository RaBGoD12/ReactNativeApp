@echo off
echo "=== Verificando configuracion de Android ==="

echo "1. Verificando Java:"
java -version

echo ""
echo "2. Verificando variables de entorno:"
echo "ANDROID_HOME: %ANDROID_HOME%"
echo "JAVA_HOME: %JAVA_HOME%"

echo ""
echo "3. Verificando ADB:"
adb version

echo ""
echo "4. Verificando dispositivos conectados:"
adb devices

echo ""
echo "5. Intentando ejecutar gradlew:"
cd android
gradlew.bat --version
cd ..

echo ""
echo "=== Fin del diagnostico ==="
pause
