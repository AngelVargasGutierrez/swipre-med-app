@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title SWIPRE-MED - Instalador

REM Este script se puede descargar SOLO (sin clonar nada antes) y ejecutar
REM en una carpeta vacia: clona el proyecto junto a si mismo y lo despliega.

cd /d "%~dp0"

echo ==============================================
echo   SWIPRE-MED - Instalador
echo ==============================================
echo.

set REPO_URL=https://github.com/AngelVargasGutierrez/swipre-med-app.git
set CARPETA=swipre-med-app

REM --- Verificar winget (para instalar Git si falta) ---
where winget >nul 2>nul
set TIENE_WINGET=1
if errorlevel 1 set TIENE_WINGET=0

REM --- Verificar / instalar Git ---
where git >nul 2>nul
if errorlevel 1 (
    if "%TIENE_WINGET%"=="0" (
        echo [ERROR] No se encontro Git ni winget para instalarlo automaticamente.
        echo         Instala Git manualmente desde https://git-scm.com/ y vuelve a
        echo         ejecutar este instalador.
        pause
        exit /b 1
    )
    echo [AVISO] No se encontro Git. Instalando automaticamente con winget...
    echo         ^(puede pedir permiso de administrador: acepta el aviso de Windows^)
    winget install --id Git.Git -e --silent --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
        echo [ERROR] No se pudo instalar Git automaticamente.
        echo         Descargalo manualmente desde https://git-scm.com/ y vuelve a
        echo         ejecutar este instalador.
        pause
        exit /b 1
    )
    echo [OK] Git instalado correctamente.
    echo.
    echo Cierra esta ventana y vuelve a hacer doble clic en instalar.bat
    echo para que Windows reconozca el nuevo Git instalado.
    pause
    exit /b 0
)
echo [OK] Git detectado.

REM --- Clonar (o actualizar) el proyecto junto a este script ---
if exist "%CARPETA%\desplegar.bat" (
    echo.
    echo [OK] La carpeta "%CARPETA%" ya existe, actualizando a la ultima version...
    cd /d "%~dp0%CARPETA%"
    git pull
    cd /d "%~dp0"
) else (
    echo.
    echo Clonando SWIPRE-MED ^(esto puede tardar un minuto^)...
    git clone %REPO_URL%
    if errorlevel 1 (
        echo [ERROR] No se pudo clonar el repositorio. Revisa tu conexion a internet
        echo         y que la URL del repositorio sea correcta.
        pause
        exit /b 1
    )
    echo [OK] Proyecto clonado en la carpeta "%CARPETA%".
)

echo.
echo ==============================================
echo   Continuando con el despliegue...
echo ==============================================
echo.

call "%~dp0%CARPETA%\desplegar.bat"
