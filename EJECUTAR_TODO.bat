@echo off
echo ========================================
echo   INSTALACION AUTOMATICA
echo ========================================
echo.

echo [1/2] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)

echo.
echo [2/2] Verificando instalacion...
if exist "node_modules" (
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ❌ Error: node_modules no encontrado
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ INSTALACION COMPLETADA
echo ========================================
echo.
echo Proximos pasos:
echo 1. El archivo .env ya esta creado
echo 2. Abre crear-admin-automatico.sql y copia el contenido
echo 3. Pegalo en Supabase SQL Editor
echo.
pause




