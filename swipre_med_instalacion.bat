@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title SWIPRE-MED - Instalacion y despliegue

REM Este script se puede descargar SOLO (sin tener el proyecto clonado antes)
REM y ejecutar en una carpeta vacia: clona el proyecto junto a si mismo,
REM instala todo lo necesario y lo deja corriendo.

cd /d "%~dp0"

set REPO_URL=https://github.com/AngelVargasGutierrez/swipre-med-app.git
set CARPETA=swipre-med-app
set PROYECTO=%~dp0%CARPETA%

echo ==============================================
echo   SWIPRE-MED - Instalacion y despliegue
echo ==============================================
echo.

REM --- 0. Verificar winget (para instalar Git/Node.js si faltan) ---
where winget >nul 2>nul
set TIENE_WINGET=1
if errorlevel 1 set TIENE_WINGET=0

REM --- 1. Verificar / instalar Git (hace falta para clonar el proyecto) ---
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
    echo Cierra esta ventana y vuelve a hacer doble clic en swipre_med_instalacion.bat
    echo para que Windows reconozca el nuevo Git instalado.
    pause
    exit /b 0
)
echo [OK] Git detectado.

REM --- 2. Clonar ^(o actualizar^) el proyecto junto a este script ---
if exist "%PROYECTO%\package.json" (
    echo.
    echo [OK] La carpeta "%CARPETA%" ya existe, actualizando a la ultima version...
    cd /d "%PROYECTO%"
    git pull
    cd /d "%~dp0"
) else (
    echo.
    echo Clonando SWIPRE-MED ^(esto puede tardar un minuto^)...
    git clone %REPO_URL%
    if errorlevel 1 (
        echo [ERROR] No se pudo clonar el repositorio. Revisa tu conexion a internet.
        pause
        exit /b 1
    )
    echo [OK] Proyecto clonado en la carpeta "%CARPETA%".
)

REM --- 3. Verificar / instalar Node.js ---
echo.
where node >nul 2>nul
if errorlevel 1 (
    if "%TIENE_WINGET%"=="1" (
        echo [AVISO] No se encontro Node.js. Instalando automaticamente con winget...
        echo         ^(puede pedir permiso de administrador: acepta el aviso de Windows^)
        winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
        if errorlevel 1 (
            echo [ERROR] No se pudo instalar Node.js automaticamente.
            echo         Descargalo manualmente desde https://nodejs.org/ y vuelve a
            echo         ejecutar este instalador.
            pause
            exit /b 1
        )
        echo [OK] Node.js instalado correctamente.
        echo.
        echo Cierra esta ventana y vuelve a hacer doble clic en swipre_med_instalacion.bat
        echo para que Windows reconozca el nuevo Node.js instalado.
        pause
        exit /b 0
    ) else (
        echo [ERROR] No se encontro Node.js instalado ^(y no hay winget para instalarlo solo^).
        echo         Descargalo desde https://nodejs.org/ y vuelve a correr este script.
        pause
        exit /b 1
    )
)
echo [OK] Node.js detectado:
node -v

REM --- 4. Verificar MySQL en el puerto 3306 ---
echo.
echo Verificando MySQL en el puerto 3306...
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if errorlevel 1 (
    echo [AVISO] No se detecto MySQL escuchando en el puerto 3306.
    echo         Instala XAMPP y dale "Start" a MySQL antes de continuar
    echo         ^(ver DEPLOYMENT.md ^(dentro de la carpeta %CARPETA%^), seccion
    echo         "1. Instalar XAMPP y MySQL"^).
    echo         Cuando este corriendo, presiona una tecla para continuar...
    pause >nul
    powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
    if errorlevel 1 (
        echo [ERROR] MySQL sigue sin responder en el puerto 3306.
        echo         Revisa DEPLOYMENT.md ^(dentro de la carpeta %CARPETA%^), seccion
        echo         "Solucion de problemas comunes".
        pause
        exit /b 1
    )
)
echo [OK] MySQL esta activo.

REM --- 5. Instalar dependencias del frontend ---
cd /d "%PROYECTO%"
echo.
echo Instalando dependencias del frontend ^(puede tardar un par de minutos^)...
call npm install
if errorlevel 1 (
    echo [ERROR] Fallo "npm install" en el frontend.
    pause
    exit /b 1
)

REM --- 6. Instalar dependencias del backend ---
echo.
echo Instalando dependencias del backend...
cd /d "%PROYECTO%\backend"
call npm install
if errorlevel 1 (
    echo [ERROR] Fallo "npm install" en el backend.
    cd /d "%~dp0"
    pause
    exit /b 1
)

REM --- 7. Configurar backend\.env si no existe ---
set PRIMERA_VEZ=0
if not exist ".env" (
    echo.
    echo Creando backend\.env desde la plantilla...
    copy .env.example .env >nul
    set PRIMERA_VEZ=1
    echo [OK] Se creo backend\.env con usuario root y sin contrasena ^(valores por defecto^).
    echo      Si tu MySQL usa una contrasena distinta, abre %CARPETA%\backend\.env,
    echo      edita DB_PASS, guarda el archivo y luego presiona una tecla para continuar.
    pause >nul
) else (
    echo.
    echo [OK] backend\.env ya existia, se conserva tal cual esta.
)

REM --- 8. Poblar la base de datos solo la primera vez ---
if "%PRIMERA_VEZ%"=="1" (
    echo.
    echo Creando la base de datos y los datos de ejemplo...
    call npm run setup
    if errorlevel 1 (
        echo [ERROR] No se pudo crear la base de datos.
        echo         Revisa %CARPETA%\backend\.env ^(usuario/contrasena^) y que MySQL
        echo         este corriendo.
        cd /d "%~dp0"
        pause
        exit /b 1
    )
) else (
    echo [OK] Se omite la creacion de datos de ejemplo para no borrar datos existentes.
    echo      ^(Si quieres recrearlos desde cero, corre "npm run setup" dentro de backend\^)
)

cd /d "%~dp0"

REM --- 9. Levantar backend y frontend en ventanas separadas ---
echo.
echo Levantando el backend en una ventana aparte...
start "SWIPRE-MED - Backend (puerto 3001)" cmd /k "cd /d "%PROYECTO%\backend" && npm start"

ping -n 4 127.0.0.1 >nul

echo Levantando el frontend en una ventana aparte...
start "SWIPRE-MED - Frontend (puerto 5173)" cmd /k "cd /d "%PROYECTO%" && npm run dev"

ping -n 5 127.0.0.1 >nul

echo.
echo ==============================================
echo   Listo. Abriendo el navegador...
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo   Login:    admin / admin123
echo ==============================================
start http://localhost:5173

echo.
echo El proyecto quedo en la carpeta "%CARPETA%", junto a este script.
echo Esta ventana ya puede cerrarse. El backend y el frontend quedaron
echo corriendo en sus propias ventanas: no las cierres mientras uses el sistema.
pause
