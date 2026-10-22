const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',           require('./routes/auth'));
app.use('/api/medicamentos',   require('./routes/medicamentos'));
app.use('/api/laboratorios',   require('./routes/laboratorios'));
app.use('/api/dashboard',      require('./routes/dashboard'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/analytics',      require('./routes/analytics'));
app.use('/api/inventario',     require('./routes/inventario'));
app.use('/api/users',          require('./routes/users'));
app.use('/api/reportes',       require('./routes/reportes'));

// --- Servir Frontend en Producción ---
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`SIPGIMED Backend → http://localhost:${PORT}`));
