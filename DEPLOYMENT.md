# Manual de despliegue local — SWIPRE-MED

Guía paso a paso para levantar el sistema SWIPRE-MED (SIPGIMED) en una máquina nueva,
con el frontend, el backend y la base de datos funcionando.

Tiempo estimado: 20-30 minutos.

---

## 1. Instalar XAMPP y MySQL

**Este es el primer paso y hay que hacerlo antes que cualquier otra cosa.** SWIPRE-MED
necesita un servidor MySQL corriendo en `localhost:3306`, y la forma más simple de tenerlo
en Windows es con **XAMPP** (incluye MySQL/MariaDB listo para usar, sin configurar nada).

### 1.1. Descargar XAMPP

Entra a <https://www.apachefriends.org/> y descarga el instalador para Windows (la versión
más reciente sirve).

Captura de pantalla

### 1.2. Instalar XAMPP

Ejecuta el instalador descargado. Durante la instalación:

- Si Windows muestra un aviso de **Control de cuentas de usuario**, acepta.
- Si aparece un aviso sobre el **Antivirus/UAC**, puedes continuar igual.
- En la selección de componentes, deja todo marcado por defecto (al menos debe quedar
  marcado **MySQL**).
- En la carpeta de instalación, deja la que viene por defecto (`C:\xampp`).
- Dale **Next** en todas las pantallas hasta que termine, y **Finish** al final.

Captura de pantalla

### 1.3. Abrir el Panel de Control de XAMPP

Al terminar la instalación se abre solo el **Panel de Control de XAMPP** (si no se abre,
búscalo en el menú de inicio como "XAMPP Control Panel"). Vas a ver una lista de módulos
(Apache, MySQL, FileZilla, etc.), todos apagados.

Captura de pantalla

### 1.4. Iniciar MySQL

En la fila de **MySQL**, haz clic en el botón **Start**.

Captura de pantalla

Espera unos segundos. El módulo **MySQL** debe quedar resaltado en **verde**, con el botón
cambiando de "Start" a "Stop" y mostrando el puerto (3306) a la derecha. Eso confirma que
MySQL ya está corriendo.

Captura de pantalla

> **Importante:** cada vez que reinicies la PC o cierres XAMPP, tienes que volver a abrir el
> Panel de Control y darle **Start** a MySQL de nuevo antes de usar SWIPRE-MED — XAMPP no
> arranca automáticamente con Windows a menos que lo configures aparte.

Con esto, MySQL ya queda listo para los pasos siguientes. **No hace falta crear ninguna
base de datos a mano** — eso lo hace un script más adelante en este manual.

---

## 2. Otros requisitos previos

Instala también esto:

| Herramienta | Versión recomendada | Para qué |
|---|---|---|
| **Node.js** | 20 LTS o superior (probado con Node 22) | Correr el frontend (Vite/React) y el backend (Express) |
| **Git** | Cualquiera reciente | Clonar el repositorio |

Verifica las versiones instaladas:

```bash
node -v
npm -v
```

> Si usas `desplegar.bat` o `swipre_med_instalacion.bat` (incluidos en este repositorio),
> Node.js y Git se pueden instalar automáticamente por ti — pero igual puedes instalarlos a
> mano desde [nodejs.org](https://nodejs.org/) y [git-scm.com](https://git-scm.com/) si lo
> prefieres. Esos scripts automatizan los pasos 2 al 9 de este manual; **MySQL siempre hay
> que instalarlo a mano siguiendo el paso 1**, los scripts no lo hacen por ti.

---

## 3. Clonar el repositorio

```bash
git clone <URL_DEL_REPO> SWIPRE-MED
cd SWIPRE-MED
```

El proyecto tiene **dos partes independientes**, cada una con su propio `package.json`:

- `/` (raíz) → frontend en React + Vite
- `/backend` → API en Express + MySQL

---

## 4. Instalar dependencias

Hay que instalar dependencias **dos veces**: una para el frontend y otra para el backend.

```bash
# Desde la raíz del proyecto (frontend)
npm install

# Backend
cd backend
npm install
cd ..
```

> Antes de seguir, confirma que MySQL sigue corriendo (paso 1): en el Panel de Control de
> XAMPP, **MySQL** debe seguir en verde. Si lo cerraste, dale **Start** de nuevo.
>
> **Si ya tienes otro MySQL instalado en la máquina** (por ejemplo el instalador oficial de
> MySQL Server), puede que ese otro servicio ya esté usando el puerto 3306 y XAMPP no pueda
> levantar el suyo en el mismo puerto, o viceversa. Revisa la sección
> [Solución de problemas](#10-solución-de-problemas-comunes) más abajo si tienes dudas.

---

## 5. Configurar el backend (`.env`)

El backend necesita un archivo `backend/.env` con las credenciales de la base de datos.
Ese archivo **no viene en el repositorio** (está en `.gitignore` a propósito, porque
contiene credenciales). Cópialo desde la plantilla:

```bash
cd backend
copy .env.example .env      # Windows (PowerShell/cmd)
# cp .env.example .env      # Mac/Linux
```

Abre `backend/.env` y revisa estos valores:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=swipre_med
PORT=3001
```

- Si tu MySQL/XAMPP usa el usuario `root` **sin contraseña** (lo normal en una instalación
  nueva de XAMPP), deja `DB_PASS` vacío tal como está.
- Si le pusiste contraseña a tu `root`, complétala ahí.
- No hace falta crear la base de datos `swipre_med` a mano — el script del paso 6 la crea
  sola.

La IA de búsqueda (Gemini) es **opcional** — el sistema funciona completo sin ella (cae a un
catálogo local automáticamente). Ver la nota al final del documento si quieres activarla.

---

## 6. Crear la base de datos y los datos iniciales

Hay **dos formas** de poblar la base de datos. Para desplegar y probar el sistema, usa la
**Opción A**.

### Opción A — Setup rápido (recomendado)

Desde `backend/`, corre:

```bash
npm run setup
```

Esto crea automáticamente la base de datos `swipre_med`, todas las tablas, y carga un set
de datos de ejemplo: 20 medicamentos y 6 usuarios de prueba (ver tabla de credenciales en
el paso 9). Si ves al final:

```
🎉 ¡Setup completo! Base de datos SIPGIMED lista.
```

la base quedó lista.

> Puedes correr `npm run setup` las veces que quieras: cada vez borra los datos anteriores
> y vuelve a insertar el set de ejemplo desde cero (no borra la base de datos en sí, solo
> las filas de las tablas).

### Opción B — Dataset completo (más de 8,000 medicamentos reales)

Si en vez del set de ejemplo quieres el volcado completo que se usó en producción
(`heroku_database_dump.sql`, en la raíz del repo), créalo así:

```bash
# 1. Crea la base de datos vacía (ajusta el usuario si no es root)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS swipre_med CHARACTER SET utf8mb4;"

# 2. Importa el volcado completo (desde la raíz del repo)
mysql -u root swipre_med < heroku_database_dump.sql
```

Con XAMPP, el ejecutable de `mysql` suele estar en
`C:\xampp\mysql\bin\mysql.exe` (usa la ruta completa si `mysql` no está en el PATH).

Esta opción trae los mismos 6 usuarios de prueba, pero miles de medicamentos reales en vez
de los 20 de ejemplo. Tarda uno o dos minutos en importar.

---

## 7. Levantar el backend

Desde `backend/`:

```bash
npm start
```

Deberías ver:

```
SIPGIMED Backend → http://localhost:3001
```

Para confirmarlo, abre en el navegador (o con `curl`) `http://localhost:3001/api/medicamentos`
— debe devolver una lista en JSON, no un error.

> Tip: si vas a estar modificando código del backend, usa `npm run dev` en su lugar
> (usa `nodemon`, reinicia solo con cada cambio).

**Deja esta terminal abierta** — el backend debe seguir corriendo.

---

## 8. Levantar el frontend

Abre **una segunda terminal**, en la raíz del proyecto (no en `backend/`):

```bash
npm run dev
```

Vite va a mostrar algo como:

```
➜  Local:   http://localhost:5173/
```

Abre esa URL en el navegador.

---

## 9. Verificar que todo funciona

En la pantalla de login, entra con cualquiera de estos usuarios de prueba (ambas opciones
de datos del paso 6 traen los mismos usuarios):

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador (acceso completo) |
| `farmacia` | `farmacia123` | Farmacia |
| `jefatura` | `jefatura123` | Jefatura |
| `almacen` | `almacen123` | Almacén |
| `logistica` | `logistica123` | Logística |

Si entras y ves el Dashboard con datos (medicamentos, gráficos, notificaciones), el
despliegue quedó correcto.

---

## 10. Solución de problemas comunes

**`ERROR 2003: Can't connect to MySQL server` / el backend no conecta a la base de datos**
→ MySQL no está corriendo, o está corriendo en un puerto distinto a 3306. Revisa el panel
de XAMPP, o corre `Get-NetTCPConnection -LocalPort 3306 -State Listen` en PowerShell para
confirmar que algo esté escuchando ahí.

**`Access denied for user 'root'@'localhost'`**
→ La contraseña en `backend/.env` (`DB_PASS`) no coincide con la de tu MySQL. Si acabas de
instalar XAMPP, el root normalmente no tiene contraseña (`DB_PASS=` vacío). Si tienes otra
instalación de MySQL con contraseña propia, ponla ahí.

**Tengo dos MySQL instalados y no sé cuál está activo en el 3306**
→ Corre esto en PowerShell para ver qué proceso escucha en ese puerto:
  ```powershell
  Get-NetTCPConnection -LocalPort 3306 -State Listen | Select-Object OwningProcess
  Get-Process -Id <ese_PID>
  ```
  Si tienes más de un MySQL instalado (p. ej. XAMPP + el instalador oficial de MySQL),
  asegúrate de que el que uses tenga `port=3306` en su archivo de configuración (`my.ini`)
  y que sea ese el que está corriendo. No hace falta desinstalar el otro, solo que no
  compitan por el mismo puerto a la vez.

**El frontend carga pero no trae datos / "Error 500" / "reinicia el backend (puerto 3001)"**
→ El backend no está corriendo, se cayó, o no pudo conectarse a la base de datos. Revisa la
terminal donde corriste `npm start` en `backend/` — ahí va a aparecer el error real.

**Puerto 3001 o 5173 ya en uso**
→ Otro proceso (quizás una sesión anterior que quedó corriendo) está usando ese puerto.
  Ciérralo o cambia el puerto: para el backend, el valor `PORT` en `backend/.env`; para el
  frontend, `npm run dev -- --port 5174`.

**La búsqueda con IA no trae sugerencias de Gemini**
→ Es esperado si no configuraste tu propia `GEMINI_API_KEY`: el sistema sigue funcionando
normal, solo que las sugerencias vienen de un catálogo local reducido en vez de la IA. No
afecta el resto del sistema (medicamentos, inventario, reportes, usuarios, etc.).

---

## 11. (Opcional) Activar la búsqueda con IA — Gemini

La búsqueda inteligente de medicamentos usa la API de Google Gemini. Es un extra: todo lo
demás del sistema funciona sin esto.

1. Crea tu propia clave gratis en <https://aistudio.google.com/apikey>.
2. En `backend/.env`, agrega:
   ```env
   GEMINI_API_KEY=tu_clave_aqui
   GEMINI_MODEL=gemini-2.0-flash
   ```
3. Reinicia el backend (`Ctrl+C` en su terminal y vuelve a correr `npm start`).

---

## Resumen de comandos (cheat sheet)

```bash
# --- Instalación (una sola vez) ---
git clone <URL_DEL_REPO> SWIPRE-MED
cd SWIPRE-MED
npm install
cd backend
npm install
copy .env.example .env      # y editar DB_PASS si hace falta
npm run setup                # crea la BD y los datos de ejemplo
cd ..

# --- Cada vez que quieras levantar el sistema ---
# Terminal 1 (backend):
cd backend
npm start

# Terminal 2 (frontend):
npm run dev

# Abrir: http://localhost:5173
# Login: admin / admin123
```
