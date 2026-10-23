@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title SWIPRE-MED - Despliegue local

REM Nos anclamos a la carpeta donde esta este .bat, sin importar desde
REM donde se lo haya invocado (doble clic, acceso directo, otra terminal, etc.)
cd /d "%~dp0"

echo ==============================================
echo   SWIPRE-MED - Despliegue local
echo ==============================================
echo.

REM --- 0. Verificar winget (necesario para instalar Node.js/Git automaticamente) ---
where winget >nul 2>nul
set TIENE_WINGET=1
if errorlevel 1 set TIENE_WINGET=0

REM --- 1. Verificar Node.js (lo instala solo si falta y hay winget) ---
where node >nul 2>nul
if errorlevel 1 (
    if "%TIENE_WINGET%"=="1" (
        echo [AVISO] No se encontro Node.js. Instalando automaticamente con winget...
        echo         ^(puede pedir permiso de administrador: acepta el aviso de Windows^)
        winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
        if errorlevel 1 (
            echo [ERROR] No se pudo instalar Node.js automaticamente.
            echo         Descargalo manualmente desde https://nodejs.org/ y vuelve a correr este script.
            pause
            exit /b 1
        )
        echo [OK] Node.js instalado correctamente.
        echo.
        echo Cierra esta ventana y vuelve a hacer doble clic en desplegar.bat
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

REM --- 2. Verificar Git (opcional, solo para comodidad; no bloquea el resto) ---
where git >nul 2>nul
if errorlevel 1 (
    if "%TIENE_WINGET%"=="1" (
        echo.
        echo [AVISO] No se encontro Git. Instalando automaticamente con winget...
        winget install --id Git.Git -e --silent --accept-package-agreements --accept-source-agreements >nul 2>nul
        if errorlevel 1 (
            echo [AVISO] No se pudo instalar Git automaticamente ^(no es bloqueante, puedes seguir^).
            echo          Descargalo luego desde https://git-scm.com/ si lo necesitas.
        ) else (
            echo [OK] Git instalado ^(estara disponible en una terminal nueva^).
        )
    )
) else (
    echo [OK] Git detectado.
)

REM --- 3. Verificar MySQL en el puerto 3306 ---
echo.
echo Verificando MySQL en el puerto 3306...
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if errorlevel 1 (
    echo [AVISO] No se detecto MySQL escuchando en el puerto 3306.
    echo         Instala XAMPP y dale "Start" a MySQL antes de continuar
    echo         ^(ver DEPLOYMENT.md, seccion "1. Instalar XAMPP y MySQL"^).
    echo         Cuando este corriendo, presiona una tecla para continuar...
    pause >nul
    powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
    if errorlevel 1 (
        echo [ERROR] MySQL sigue sin responder en el puerto 3306.
        echo         Revisa DEPLOYMENT.md, seccion "Solucion de problemas comunes".
        pause
        exit /b 1
    )
)
echo [OK] MySQL esta activo.

REM --- 3. Instalar dependencias del frontend ---
echo.
echo Instalando dependencias del frontend (puede tardar un par de minutos)...
call npm install
if errorlevel 1 (
    echo [ERROR] Fallo "npm install" en el frontend.
    pause
    exit /b 1
)

REM --- 4. Instalar dependencias del backend ---
echo.
echo Instalando dependencias del backend...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo [ERROR] Fallo "npm install" en el backend.
    cd /d "%~dp0"
    pause
    exit /b 1
)

REM --- 5. Configurar backend\.env si no existe ---
set PRIMERA_VEZ=0
if not exist ".env" (
    echo.
    echo Creando backend\.env desde la plantilla...
    copy .env.example .env >nul
    set PRIMERA_VEZ=1
    echo [OK] Se creo backend\.env con usuario root y sin contrasena ^(valores por defecto^).
    echo      Si tu MySQL usa una contrasena distinta, abre backend\.env, edita DB_PASS,
    echo      guarda el archivo y luego presiona una tecla para continuar.
    pause >nul
) else (
    echo.
    echo [OK] backend\.env ya existia, se conserva tal cual esta.
)

REM --- 6. Poblar la base de datos solo la primera vez ---
if "%PRIMERA_VEZ%"=="1" (
    echo.
    echo Creando la base de datos y los datos de ejemplo...
    call npm run setup
    if errorlevel 1 (
        echo [ERROR] No se pudo crear la base de datos.
        echo         Revisa backend\.env ^(usuario/contrasena^) y que MySQL este corriendo.
        cd /d "%~dp0"
        pause
        exit /b 1
    )
) else (
    echo [OK] Se omite la creacion de datos de ejemplo para no borrar tus datos actuales.
    echo      ^(Si quieres recrearlos desde cero, corre "npm run setup" dentro de backend\^)
)

cd /d "%~dp0"

REM --- 7. Levantar backend y frontend en ventanas separadas ---
echo.
echo Levantando el backend en una ventana aparte...
start "SWIPRE-MED - Backend (puerto 3001)" cmd /k "cd /d "%~dp0backend" && npm start"

ping -n 4 127.0.0.1 >nul

echo Levantando el frontend en una ventana aparte...
start "SWIPRE-MED - Frontend (puerto 5173)" cmd /k "cd /d "%~dp0" && npm run dev"

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
echo Esta ventana ya puede cerrarse. El backend y el frontend quedaron
echo corriendo en sus propias ventanas: no las cierres mientras uses el sistema.
pause
