# SWIPRE-MED

Sistema de gestión de inventario farmacéutico (SIPGIMED) — frontend en React + Vite,
backend en Express + MySQL.

## Despliegue local

> 📘 Sigue el [Manual de despliegue local](DEPLOYMENT.md) paso a paso.

Forma rápida (Windows, con Node.js y MySQL/XAMPP ya instalados):

```bash
git clone https://github.com/AngelVargasGutierrez/swipre-med-app.git
cd swipre-med-app
desplegar.bat
```

El script instala las dependencias, crea la base de datos con datos de ejemplo, y levanta
el backend (`:3001`) y el frontend (`:5173`) automáticamente.

## Estructura

- `/` — frontend (React 19 + Vite)
- `/backend` — API REST (Express + MySQL vía `mysql2`)
- `heroku_database_dump.sql` — volcado completo con el dataset real de medicamentos (opcional, ver `DEPLOYMENT.md`)
