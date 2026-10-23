# Manual de despliegue local — SWIPRE-MED

Guía para levantar el sistema SWIPRE-MED (SIPGIMED) en una máquina nueva, con el frontend,
el backend y la base de datos funcionando.

---

## 1. Elige cómo vas a desplegar

Hay dos formas de hacerlo. La diferencia es cuánto quieres automatizar.

### Opción A — Instalador automático (recomendado)

El repositorio incluye `swipre_med_instalacion.bat`. Este script:

- Instala **Node.js** y **Git** automáticamente si no los tienes (usando `winget`, el
  gestor de paquetes de Windows).
- Instala **MariaDB** (compatible con MySQL) automáticamente si no detecta ningún servidor
  de base de datos corriendo en el puerto 3306 — configurado con usuario `root` sin
  contraseña y arranque automático con Windows, listo para usar.
- Clona el proyecto, instala las dependencias, crea la base de datos con datos de ejemplo,
  y levanta el backend y el frontend.

Solo necesitas:

1. Descargar `swipre_med_instalacion.bat` (del repositorio, o directamente desde
   <https://raw.githubusercontent.com/AngelVargasGutierrez/swipre-med-app/main/swipre_med_instalacion.bat>)
   en una carpeta vacía.
2. Hacer doble clic.

> **Si Windows bloquea el archivo** con un aviso de "Control de aplicaciones inteligente"
> o similar (porque se descargó de internet): clic derecho sobre el archivo →
> **Ejecutar como administrador**. Eso evita el bloqueo sin tener que cambiar ninguna
> configuración de seguridad de Windows.

Con esto ya está — puedes saltar directo al [paso 9, Verificar que todo funciona](#9-verificar-que-todo-funciona).

Si ya tienes el proyecto clonado (no necesitas que te lo clone de nuevo), usa
`desplegar.bat` en su lugar — hace lo mismo pero sin el paso de clonar.

### Opción B — Paso a paso manual

Si prefieres instalar todo tú mismo (o quieres entender qué hace el instalador por
dentro), sigue el resto de este manual desde el paso 2.

---

## 2. Instalar MySQL (manual, solo si elegiste la Opción B)

> Si usaste el instalador automático de la Opción A, **sáltate este paso** — ya tienes
> MariaDB instalado y corriendo. Esta sección es solo para quien prefiere instalarlo a mano.

SWIPRE-MED necesita un servidor MySQL corriendo en `localhost:3306`. La forma más simple
en Windows es con **XAMPP** (incluye MySQL/MariaDB listo para usar, sin configurar nada).

### 2.1. Descargar XAMPP

Entra a <https://www.apachefriends.org/> y descarga el instalador para Windows (la versión
más reciente sirve).

Captura de pantalla

### 2.2. Instalar XAMPP

Ejecuta el instalador descargado. Durante la instalación:

- Si Windows muestra un aviso de **Control de cuentas de usuario**, acepta.
- Si aparece un aviso sobre el **Antivirus/UAC**, puedes continuar igual.
- En la selección de componentes, deja todo marcado por defecto (al menos debe quedar
  marcado **MySQL**).
- En la carpeta de instalación, deja la que viene por defecto (`C:\xampp`).
- Dale **Next** en todas las pantallas hasta que termine, y **Finish** al final.

Captura de pantalla

### 2.3. Abrir el Panel de Control de XAMPP

Al terminar la instalación se abre solo el **Panel de Control de XAMPP** (si no se abre,
búscalo en el menú de inicio como "XAMPP Control Panel"). Vas a ver una lista de módulos
(Apache, MySQL, FileZilla, etc.), todos apagados.

Captura de pantalla

### 2.4. Iniciar MySQL

En la fila de **MySQL**, haz clic en el botón **Start**.

Captura de pantalla

Espera unos segundos. El módulo **MySQL** debe quedar resaltado en **verde**, con el botón
cambiando de "Start" a "Stop" y mostrando el puerto (3306) a la derecha. Eso confirma que
MySQL ya está corriendo.

Captura de pantalla

> **Importante:** cada vez que reinicies la PC o cierres XAMPP, tienes que volver a abrir el
> Panel de Control y darle **Start** a MySQL de nuevo antes de usar SWIPRE-MED — XAMPP no
> arranca automáticamente con Windows a menos que lo configures aparte (a diferencia de la
> instalación automática de la Opción A, que sí arranca sola con Windows).

Con esto, MySQL ya queda listo para los pasos siguientes. **No hace falta crear ninguna
base de datos a mano** — eso lo hace un script más adelante en este manual.

---

## 3. Otros requisitos previos (solo Opción B)

Instala también esto:

| Herramienta | Versión recomendada | Para qué |
|---|---|---|
| **Node.js** | 20 LTS o superior (probado con Node 22) | Correr el frontend (Vite/React) y el backend (Express) |
| **Git** | Cualquiera reciente | Clonar el repositorio |

Descárgalos de [nodejs.org](https://nodejs.org/) y [git-scm.com](https://git-scm.com/).
Verifica las versiones instaladas:

```bash
node -v
npm -v
```

---

## 4. Clonar el repositorio

```bash
git clone https://github.com/AngelVargasGutierrez/swipre-med-app.git SWIPRE-MED
cd SWIPRE-MED
```

El proyecto tiene **dos partes independientes**, cada una con su propio `package.json`:

- `/` (raíz) → frontend en React + Vite
- `/backend` → API en Express + MySQL

---

## 5. Instalar dependencias

Hay que instalar dependencias **dos veces**: una para el frontend y otra para el backend.

```bash
# Desde la raíz del proyecto (frontend)
npm install

# Backend
cd backend
npm install
cd ..
```

> Antes de seguir, confirma que MySQL sigue corriendo (paso 2): en el Panel de Control de
> XAMPP, **MySQL** debe seguir en verde. Si lo cerraste, dale **Start** de nuevo.
>
> **Si ya tienes otro MySQL instalado en la máquina** (por ejemplo el instalador oficial de
> MySQL Server, o MariaDB de una instalación anterior), puede que ese otro servicio ya esté
> usando el puerto 3306 y XAMPP no pueda levantar el suyo en el mismo puerto, o viceversa.
> Revisa la sección [Solución de problemas](#10-solución-de-problemas-comunes) más abajo si
> tienes dudas.

---

## 6. Configurar el backend (`.env`)

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

- Si tu MySQL/MariaDB usa el usuario `root` **sin contraseña** (lo normal en una
  instalación nueva de XAMPP o en el instalador automático), deja `DB_PASS` vacío tal
  como está.
- Si le pusiste contraseña a tu `root`, complétala ahí.
- No hace falta crear la base de datos `swipre_med` a mano — el script del paso 7 la crea
  sola.

La IA de búsqueda (Gemini) es **opcional** — el sistema funciona completo sin ella (cae a un
catálogo local automáticamente). Ver la nota al final del documento si quieres activarla.

---

## 7. Crear la base de datos y los datos iniciales

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
`C:\xampp\mysql\bin\mysql.exe` (usa la ruta completa si `mysql` no está en el PATH). Con
la instalación automática (MariaDB), suele estar en
`C:\Program Files\MariaDB 13.0\bin\mysql.exe`.

Esta opción trae los mismos 6 usuarios de prueba, pero miles de medicamentos reales en vez
de los 20 de ejemplo. Tarda uno o dos minutos en importar.

---

## 8. Levantar el backend y el frontend

Desde `backend/`:

```bash
npm start
```

Deberías ver:

```
SIPGIMED Backend → http://localhost:3001
```

**Deja esa terminal abierta**, y abre **una segunda terminal** en la raíz del proyecto
(no en `backend/`):

```bash
npm run dev
```

Vite va a mostrar algo como:

```
➜  Local:   http://localhost:5173/
```

> Tip: si vas a estar modificando código del backend, usa `npm run dev` ahí también en
> lugar de `npm start` (usa `nodemon`, reinicia solo con cada cambio).

---

## 9. Verificar que todo funciona

Abre `http://localhost:5173` en el navegador. En la pantalla de login, entra con
cualquiera de estos usuarios de prueba:

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

**Windows bloquea el `.bat` con "Control de aplicaciones inteligente" / "este archivo
podría no ser seguro"**
→ Esto pasa porque el archivo se descargó de internet y no está firmado digitalmente.
Clic derecho sobre el `.bat` → **Ejecutar como administrador**. Con eso alcanza, no hace
falta desactivar ninguna protección de Windows (y desactivar "Control de aplicaciones
inteligente" no se puede revertir sin reinstalar Windows, así que no lo hagas por esto).

**`ERROR 2003: Can't connect to MySQL server` / el backend no conecta a la base de datos**
→ MySQL no está corriendo, o está corriendo en un puerto distinto a 3306. Si usaste XAMPP,
revisa el panel; si usaste el instalador automático, revisa que el servicio **MariaDB**
esté iniciado (`services.msc` → buscar "MariaDB" → Iniciar). También puedes correr
`Get-NetTCPConnection -LocalPort 3306 -State Listen` en PowerShell para confirmar que algo
esté escuchando ahí.

**`Access denied for user 'root'@'localhost'`**
→ La contraseña en `backend/.env` (`DB_PASS`) no coincide con la de tu MySQL. Tanto XAMPP
como el instalador automático dejan a `root` sin contraseña por defecto (`DB_PASS=`
vacío). Si tienes otra instalación de MySQL con contraseña propia, ponla ahí.

**Tengo dos MySQL instalados y no sé cuál está activo en el 3306**
→ Corre esto en PowerShell para ver qué proceso escucha en ese puerto:
  ```powershell
  Get-NetTCPConnection -LocalPort 3306 -State Listen | Select-Object OwningProcess
  Get-Process -Id <ese_PID>
  ```
  Si tienes más de un MySQL instalado (p. ej. XAMPP + el instalador automático +
  MySQL Server), asegúrate de que solo uno de ellos esté usando el puerto 3306 a la vez.
  No hace falta desinstalar los demás, solo que no compitan por el mismo puerto.

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
# --- Instalación (una sola vez, Opción B manual) ---
git clone https://github.com/AngelVargasGutierrez/swipre-med-app.git SWIPRE-MED
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
