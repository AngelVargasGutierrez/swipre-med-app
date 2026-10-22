/**
 * SIPGIMED — Setup completo de base de datos MySQL
 * Ejecutar: node db/setup.js
 * Crea la BD, todas las tablas e inserta los datos iniciales.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const cfg = process.env.JAWSDB_URL || {
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
};
const DB = process.env.DB_NAME || 'sipgimed';

async function run() {
  const conn = await mysql.createConnection(cfg);
  console.log('✅ Conectado a MySQL');

  /* ── Crear base de datos (Omitir en Heroku) ──────────────── */
  if (!process.env.JAWSDB_URL) {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${DB}\``);
    console.log(`✅ Base de datos "${DB}" lista`);
  } else {
    console.log(`✅ Usando base de datos provista por JawsDB`);
  }

  /* ── Crear tablas ─────────────────────────────────── */
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      username   VARCHAR(50)  UNIQUE NOT NULL,
      password   VARCHAR(100) NOT NULL,
      role       VARCHAR(20)  NOT NULL,
      name       VARCHAR(100) NOT NULL,
      role_label VARCHAR(50)  NOT NULL,
      email      VARCHAR(100),
      estado     VARCHAR(20)  DEFAULT 'Activo',
      created_at DATE
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS medicamentos (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      codigo       VARCHAR(20)    UNIQUE NOT NULL,
      nombre       VARCHAR(200)   NOT NULL,
      laboratorio  VARCHAR(100),
      lote         VARCHAR(50),
      stock        INT            DEFAULT 0,
      stock_min    INT            DEFAULT 0,
      costo_unit   DECIMAL(10,2)  DEFAULT 0,
      precio_venta DECIMAL(10,2)  DEFAULT 0,
      vencimiento  DATE,
      r_sanitario  VARCHAR(50),
      estado       VARCHAR(20)    DEFAULT 'Normal',
      categoria    VARCHAR(100)
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id        INT AUTO_INCREMENT PRIMARY KEY,
      tipo      VARCHAR(50),
      titulo    VARCHAR(200),
      descripcion TEXT,
      fecha     VARCHAR(50),
      color     VARCHAR(20),
      leida     TINYINT(1) DEFAULT 0,
      prioridad VARCHAR(10) DEFAULT 'Low'
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS movimientos_semana (
      id       INT AUTO_INCREMENT PRIMARY KEY,
      dia      VARCHAR(10),
      entradas INT DEFAULT 0,
      salidas  INT DEFAULT 0
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS comparativa_mensual (
      id      INT AUTO_INCREMENT PRIMARY KEY,
      mes     VARCHAR(10),
      ventas  INT DEFAULT 0,
      compras INT DEFAULT 0
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS prediccion_demanda (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      mes        VARCHAR(10),
      real_val   INT,
      prediccion INT
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS tendencias (
      id        INT AUTO_INCREMENT PRIMARY KEY,
      categoria VARCHAR(100),
      cambio    INT,
      positivo  TINYINT(1) DEFAULT 1
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS predicciones_criticas (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      nombre         VARCHAR(200),
      stock_actual   INT,
      fecha_predicha VARCHAR(20),
      ordenar        INT,
      prioridad      VARCHAR(10)
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS alertas (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      titulo      VARCHAR(200),
      descripcion TEXT,
      fecha       VARCHAR(50),
      color       VARCHAR(20)
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS historial_acciones (
      id      INT AUTO_INCREMENT PRIMARY KEY,
      fecha   VARCHAR(50),
      usuario VARCHAR(100),
      accion  VARCHAR(200),
      modulo  VARCHAR(50),
      detalle TEXT
    )
  `);

  console.log('✅ Tablas creadas');

  /* ── Limpiar datos anteriores ────────────────────── */
  const tablas = [
    'historial_acciones','alertas','predicciones_criticas','tendencias',
    'prediccion_demanda','comparativa_mensual','movimientos_semana',
    'notificaciones','medicamentos','users',
  ];
  for (const t of tablas) await conn.execute(`DELETE FROM \`${t}\``);
  console.log('✅ Datos anteriores eliminados');

  /* ── Insertar USERS ──────────────────────────────── */
  await conn.execute(`
    INSERT INTO users (username,password,role,name,role_label,email,estado,created_at) VALUES
    ('admin',   'admin123',   'admin',   'Juan Pérez',       'Administrador','juan.perez@sipgimed.com',      'Activo',  '2024-01-14'),
    ('farmacia','farmacia123','farmacia','María González',   'Farmacia',     'maria.gonzalez@sipgimed.com',  'Activo',  '2024-02-09'),
    ('jefatura','jefatura123','jefatura','Carlos Rodríguez','Jefatura',     'carlos.rodriguez@sipgimed.com','Activo',  '2024-01-19'),
    ('ana.lopez','ana123',    'farmacia','Ana López',        'Farmacia',     'ana.lopez@sipgimed.com',       'Inactivo','2023-11-30'),
    ('almacen', 'almacen123', 'almacen', 'Pedro Almacén',    'Almacén',      'almacen@sipgimed.com',         'Activo',  '2024-05-10'),
    ('logistica','logistica123','logistica','Ana Logística','Logística',    'logistica@sipgimed.com',       'Activo',  '2024-05-11')
  `);

  /* ── Insertar MEDICAMENTOS ───────────────────────── */
  await conn.execute(`
    INSERT INTO medicamentos
      (codigo,nombre,laboratorio,lote,stock,stock_min,costo_unit,precio_venta,vencimiento,r_sanitario,estado,categoria)
    VALUES
    ('FARM-ANL001','Paracetamol 500mg',         'Laboratorios ABC','PAR-2024-001',1500,500,0.50,1.20, '2025-12-30','RSS-001-2024','Normal', 'Analgésicos'),
    ('FARM-ANL002','Ibuprofeno 400mg',           'Farmacéutica XYZ','IBU-2024-005', 250,300,0.75,1.80, '2025-06-29','RSS-002-2024','Bajo',   'Analgésicos'),
    ('FARM-ANT001','Amoxicilina 500mg',          'BioFarma',        'AMO-2023-012',  80,200,1.10,2.80, '2024-08-14','RSS-003-2024','Crítico','Antibióticos'),
    ('FARM-CAR001','Atorvastatina 20mg',         'CardioLab',       'ATO-2024-001', 800,100,1.20,3.50, '2027-02-28','RSS-004-2024','Normal', 'Cardiovascular'),
    ('FARM-GAS001','Omeprazol 20mg',             'GastroLab',       'OME-2024-002', 600,150,0.90,2.20, '2026-09-30','RSS-005-2024','Normal', 'Antiácidos'),
    ('FARM-CAR002','Losartán 50mg',              'Cardiopharma',    'LOS-2024-001', 450,100,1.50,4.00, '2027-03-31','RSS-006-2024','Normal', 'Cardiovascular'),
    ('FARM-DIA001','Metformina 500mg',           'DiabetesCare',    'MET-2024-001', 700,200,0.60,1.50, '2026-12-31','RSS-007-2024','Normal', 'Antidiabéticos'),
    ('FARM-RES001','Salbutamol 100mcg',          'RespiraLab',      'SAL-2024-002', 150,100,3.50,8.00, '2026-06-30','RSS-008-2024','Bajo',   'Broncodilatadores'),
    ('FARM-GAS002','Ranitidina 150mg',           'GastroLab',       'RAN-2024-001', 300,100,0.80,2.00, '2026-05-04','RSS-009-2024','Normal', 'Antiácidos'),
    ('FARM-ALL001','Loratadina 10mg',            'AllergyPharma',   'LOR-2024-003', 400,150,0.45,1.10, '2027-02-28','RSS-010-2024','Normal', 'Antihistamínicos'),
    ('FARM-DER001','Betametasona Crema 0.1%',   'TopicalMed',      'BET-2024-001', 200, 50,2.00,5.00, '2026-11-30','RSS-011-2024','Normal', 'Dermatológicos'),
    ('FARM-PSI001','Alprazolam 0.5mg',           'NeuroPharma',     'ALP-2024-002',  60,100,0.90,2.50, '2025-07-31','RSS-012-2024','Crítico','Psicotrópicos'),
    ('FARM-CAR003','Enalapril 10mg',             'CardioLab',       'ENA-2024-001', 550,150,0.70,1.80, '2027-01-31','RSS-013-2024','Normal', 'Cardiovascular'),
    ('FARM-ANL003','Acetaminofén 500mg Jarabe', 'Laboratorios ABC','ACE-2024-005', 320,100,1.80,4.50, '2027-04-30','RSS-014-2024','Normal', 'Analgésicos'),
    ('FARM-DIA002','Insulina Glargina 100UI/mL','DiabetesCare',    'INS-2024-001',  50, 80,25.00,60.00,'2025-05-15','RSS-015-2024','Crítico','Antidiabéticos'),
    ('FARM-ANT002','Azitromicina 500mg',         'BioFarma',        'AZI-2024-003', 180,100,2.50,6.00, '2027-02-28','RSS-016-2024','Normal', 'Antibióticos'),
    ('FARM-GAS003','Metoclopramida 10mg',        'GastroLab',       'MTC-2024-002', 420,100,0.55,1.40, '2026-08-31','RSS-017-2024','Normal', 'Gastrointestinal'),
    ('FARM-NEU001','Sertralina 50mg',            'NeuroPharma',     'SER-2024-001', 280,100,1.30,3.20, '2027-06-30','RSS-018-2024','Normal', 'Antidepresivos'),
    ('FARM-DER002','Clotrimazol Crema 1%',      'TopicalMed',      'CLO-2024-002', 150, 50,1.50,3.80, '2027-09-30','RSS-019-2024','Normal', 'Dermatológicos'),
    ('FARM-ALL002','Cetirizina 10mg',            'AllergyPharma',   'CET-2024-001', 350,100,0.60,1.50, '2027-03-31','RSS-020-2024','Normal', 'Antihistamínicos')
  `);

  /* ── Insertar NOTIFICACIONES ─────────────────────── */
  await conn.execute(`
    INSERT INTO notificaciones (tipo,titulo,descripcion,fecha,color,leida,prioridad) VALUES
    ('stock-critico','Stock Crítico',         'Amoxicilina 500mg tiene stock crítico (80 unidades)',                            '15/4/2026, 8:00:00', 'red',   0,'High'),
    ('vencimiento',  'Medicamento por Vencer','Ranitidina 150mg vence en 10 días',                                             '15/4/2026, 8:00:00', 'red',   0,'High'),
    ('stock-bajo',   'Stock Bajo',            'Salbutamol 100mcg tiene stock bajo: 150 unidades. Mínimo requerido: 100.',       '15/4/2026, 9:00:00', 'yellow',0,'High'),
    ('nuevo-lote',   'Nuevo Lote Registrado', 'Se registró el nuevo lote PAR-2024-001 de Paracetamol 500mg con 1500 unidades.','14/4/2026',          'blue',  1,'Low'),
    ('inventario',   'Inventario Q1 2026',    'El inventario trimestral Q1 2026 fue completado. 20 medicamentos verificados.', '01/4/2026',          'green', 1,'Low')
  `);

  /* ── Insertar MOVIMIENTOS SEMANA ─────────────────── */
  await conn.execute(`
    INSERT INTO movimientos_semana (dia,entradas,salidas) VALUES
    ('Lun', 0,45),('Mar',60,50),('Mié',20,35),
    ('Jue',80,60),('Vie',40,45),('Sáb',10,25),('Dom', 0,15)
  `);

  /* ── Insertar COMPARATIVA MENSUAL ────────────────── */
  await conn.execute(`
    INSERT INTO comparativa_mensual (mes,ventas,compras) VALUES
    ('Oct',1200,1400),('Nov',1350,1300),('Dic',1400,1600),
    ('Ene', 900,1100),('Feb',1300,1350),('Mar',1450,1500),('Abr',1500,1700)
  `);

  /* ── Insertar PREDICCIÓN DEMANDA ─────────────────── */
  await conn.execute(`
    INSERT INTO prediccion_demanda (mes,real_val,prediccion) VALUES
    ('Ene',310,NULL),('Feb',350,NULL),('Mar',440,440),
    ('Abr',NULL,455),('May',NULL,462),('Jun',NULL,478)
  `);

  /* ── Insertar TENDENCIAS ─────────────────────────── */
  await conn.execute(`
    INSERT INTO tendencias (categoria,cambio,positivo) VALUES
    ('Analgésicos',      15,1),
    ('Antibióticos',     -8,0),
    ('Antiinflamatorios',22,1),
    ('Antiácidos',        5,1),
    ('Antihipertensivos',12,1)
  `);

  /* ── Insertar PREDICCIONES CRÍTICAS ──────────────── */
  await conn.execute(`
    INSERT INTO predicciones_criticas (nombre,stock_actual,fecha_predicha,ordenar,prioridad) VALUES
    ('Amoxicilina 500mg', 80, '9/5/2026', 300,'Alta'),
    ('Metformina 850mg', 180,'19/5/2026', 250,'Alta'),
    ('Ibuprofeno 400mg', 250, '4/6/2026', 200,'Media')
  `);

  /* ── Insertar ALERTAS ────────────────────────────── */
  await conn.execute(`
    INSERT INTO alertas (titulo,descripcion,fecha,color) VALUES
    ('Stock Crítico',         'Amoxicilina 500mg tiene stock crítico (80 unidades)', '15/4/2026, 8:00:00','red'),
    ('Medicamento por Vencer','Ranitidina 150mg vence en 10 días',                  '15/4/2026, 8:00:00','red'),
    ('Stock Bajo',            'Salbutamol 100mcg stock bajo (150 unidades)',         '15/4/2026, 9:00:00','yellow')
  `);

  /* ── Insertar HISTORIAL ACCIONES ─────────────────── */
  await conn.execute(`
    INSERT INTO historial_acciones (fecha,usuario,accion,modulo,detalle) VALUES
    ('15/4/2026, 10:30:00','Juan Pérez',      'Creó nuevo medicamento','Medicamentos','Paracetamol 500mg'),
    ('15/4/2026, 9:15:00', 'María González',  'Actualizó stock',       'Inventario',  'Amoxicilina 500mg'),
    ('14/4/2026, 16:00:00','Carlos Rodríguez','Generó reporte',        'Reportes',    'Reporte Q1 2026'),
    ('14/4/2026, 11:00:00','Juan Pérez',       'Registró lote',        'Inventario',  'Losartán 50mg'),
    ('13/4/2026, 14:20:00','María González',  'Marcó medicamento bajo','Inventario',  'Salbutamol 100mcg')
  `);

  await conn.end();
  console.log('');
  console.log('🎉 ¡Setup completo! Base de datos SIPGIMED lista.');
  console.log('   Ahora ejecuta: npm start   (desde la carpeta backend/)');
}

run().catch(err => {
  console.error('❌ Error en setup:', err.message);
  console.error('   Verifica usuario/contraseña en backend/.env');
  process.exit(1);
});
